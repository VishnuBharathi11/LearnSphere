import { useEffect, useMemo, useState } from "react";
import { Save, Sparkles } from "lucide-react";
import { getCertificateTemplates, saveCertificateTemplate } from "../api/certificateApi";
import { CertificateTemplateRenderer } from "../components/CertificateTemplateRegistry";
import styles from "../styles/AdminTemplateManager.module.scss";

const componentOptions = [
  "horizontal-luxury",
  "vertical-executive",
  "dark-premium",
  "glass-future",
  "academic-luxury",
];

const emptyForm = {
  code: "custom-template",
  name: "Custom Template",
  componentKey: "horizontal-luxury",
  format: "A4_LANDSCAPE",
  theme: "blue-gold",
  active: true,
  defaultTemplate: false,
  designConfigJson: "{}",
};

function AdminTemplateManagerPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    getCertificateTemplates().then(setTemplates);
  }, []);

  const preview = useMemo(
    () => ({
      id: "admin-preview",
      studentName: "Priya Nair",
      courseTitle: "Cloud Native Product Engineering",
      instructorName: "LearnSphere Faculty",
      componentKey: form.componentKey,
      templateCode: form.code,
      theme: form.theme,
      skillBadges: ["Architecture", "Cloud", "Security"],
      issuedAt: new Date().toISOString(),
    }),
    [form]
  );

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const saved = await saveCertificateTemplate(form);
    setTemplates((current) => [saved, ...current.filter((item) => item.code !== saved.code)]);
  };

  return (
    <main className={styles.managerPage}>
      <section className={styles.editorPanel}>
        <div className={styles.header}>
          <div>
            <span>Certificate system</span>
            <h1>Template Manager</h1>
          </div>
          <Sparkles size={24} />
        </div>
        <form onSubmit={submit} className={styles.templateForm}>
          <label>
            Code
            <input value={form.code} onChange={(event) => update("code", event.target.value)} />
          </label>
          <label>
            Name
            <input value={form.name} onChange={(event) => update("name", event.target.value)} />
          </label>
          <label>
            Design
            <select value={form.componentKey} onChange={(event) => update("componentKey", event.target.value)}>
              {componentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Format
            <select value={form.format} onChange={(event) => update("format", event.target.value)}>
              <option value="A4_LANDSCAPE">A4 Landscape</option>
              <option value="A4_PORTRAIT">A4 Portrait</option>
            </select>
          </label>
          <div className={styles.switchRow}>
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => update("active", event.target.checked)}
              />
              Active
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.defaultTemplate}
                onChange={(event) => update("defaultTemplate", event.target.checked)}
              />
              Default
            </label>
          </div>
          <button type="submit">
            <Save size={17} />
            Save template
          </button>
        </form>
        <div className={styles.templateList}>
          {templates.map((template) => (
            <button key={template.id} onClick={() => setForm({ ...emptyForm, ...template })}>
              <strong>{template.name}</strong>
              <span>{template.componentKey}</span>
            </button>
          ))}
        </div>
      </section>
      <section className={styles.previewPanel}>
        <CertificateTemplateRenderer certificate={preview} />
      </section>
    </main>
  );
}

export default AdminTemplateManagerPage;
