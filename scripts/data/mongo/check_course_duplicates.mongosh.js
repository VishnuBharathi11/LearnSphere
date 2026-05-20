const duplicates = db.courses.aggregate([
  { $group: { _id: "$title", docs: { $push: { _id: "$_id", createdAt: "$createdAt" } }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } },
  { $project: { _id: 0, title: "$_id", count: 1 } },
  { $sort: { count: -1, title: 1 } }
]).toArray();

printjson({ duplicateTitleGroups: duplicates.length, sample: duplicates.slice(0, 20) });
