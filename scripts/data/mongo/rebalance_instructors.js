const c = db.getCollection('courses');
const before = c.aggregate([
  { $group: { _id: '$instructorId', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray();
print('BEFORE');
printjson(before);

const ids = c.find({}, { _id: 1 }).sort({ createdAt: 1 }).toArray().map(x => x._id);
const first = ids.slice(0, 20);
const second = ids.slice(20, 35);
const third = ids.slice(35);

if (first.length) c.updateMany({ _id: { $in: first } }, { $set: { instructorId: '1' } });
if (second.length) c.updateMany({ _id: { $in: second } }, { $set: { instructorId: '2' } });
if (third.length) c.updateMany({ _id: { $in: third } }, { $set: { instructorId: '3' } });

const after = c.aggregate([
  { $group: { _id: '$instructorId', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray();
print('AFTER');
printjson(after);
