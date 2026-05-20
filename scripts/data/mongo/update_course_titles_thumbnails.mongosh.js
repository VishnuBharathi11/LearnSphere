const thumbnailMap = {
  "Web Development": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "UI/UX Design": "https://images.unsplash.com/photo-1545235617-9465d2a55698",
  "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "Mobile Development": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "Artificial Intelligence": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
  "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  "Cloud Computing": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
  "DevOps": "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "Blockchain": "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
  "Software Engineering": "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
};

const categoryById = {};
db.categories.find({}, { name: 1 }).forEach((cat) => {
  categoryById[String(cat._id)] = cat.name;
});

let updated = 0;

db.courses.find({}).forEach((course) => {
  const currentTitle = String(course.title || "").trim();
  const cleanTitle = currentTitle.replace(/\s+\d+$/, "").trim();

  const categoryName = categoryById[String(course.categoryId)] || null;
  const thumbnail = categoryName && thumbnailMap[categoryName] ? thumbnailMap[categoryName] : (course.thumbnail || "");

  const shouldUpdate = cleanTitle !== currentTitle || String(course.thumbnail || "") !== String(thumbnail || "");
  if (!shouldUpdate) return;

  db.courses.updateOne(
    { _id: course._id },
    {
      $set: {
        title: cleanTitle,
        thumbnail: thumbnail
      }
    }
  );
  updated += 1;
});

printjson({ updated });
