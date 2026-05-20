const grouped = db.courses.aggregate([
  { $group: {
      _id: "$title",
      docs: {
        $push: {
          _id: "$_id",
          createdAt: "$createdAt"
        }
      },
      count: { $sum: 1 }
    }
  },
  { $match: { count: { $gt: 1 } } }
]).toArray();

let removed = 0;

grouped.forEach((group) => {
  const sorted = group.docs.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;
    return String(b._id).localeCompare(String(a._id));
  });

  const keep = sorted[0]?._id;
  const toDelete = sorted.slice(1).map((d) => d._id);

  if (toDelete.length > 0) {
    const result = db.courses.deleteMany({ _id: { $in: toDelete } });
    removed += result.deletedCount || 0;
  }

  print(`Kept ${keep} for title: ${group._id}; deleted ${toDelete.length}`);
});

printjson({ duplicateGroupsProcessed: grouped.length, removed });
printjson({ totalCoursesAfter: db.courses.countDocuments({}) });
