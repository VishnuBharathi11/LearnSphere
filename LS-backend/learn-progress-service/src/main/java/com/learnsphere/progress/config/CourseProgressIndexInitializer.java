package com.learnsphere.progress.config;

import java.util.ArrayList;
import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class CourseProgressIndexInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        deduplicateCourseProgress();
        ensureUniqueIndex();
    }

    private void deduplicateCourseProgress() {
        List<Document> duplicates = mongoTemplate.getCollection("course_progress")
                .aggregate(List.of(
                        new Document("$sort", new Document("userId", 1)
                                .append("courseId", 1)
                                .append("updatedAt", -1)
                                .append("_id", -1)),
                        new Document("$group", new Document("_id", new Document("userId", "$userId")
                                .append("courseId", "$courseId"))
                                .append("keepId", new Document("$first", "$_id"))
                                .append("allIds", new Document("$push", "$_id"))
                                .append("count", new Document("$sum", 1))),
                        new Document("$match", new Document("count", new Document("$gt", 1))))
                ).into(new ArrayList<>());

        if (duplicates.isEmpty()) {
            return;
        }

        List<ObjectId> staleIds = new ArrayList<>();
        for (Document duplicate : duplicates) {
            ObjectId keepId = duplicate.get("keepId", ObjectId.class);
            @SuppressWarnings("unchecked")
            List<ObjectId> allIds = (List<ObjectId>) duplicate.get("allIds", List.class);
            if (allIds == null || allIds.isEmpty()) {
                continue;
            }
            for (ObjectId id : allIds) {
                if (!id.equals(keepId)) {
                    staleIds.add(id);
                }
            }
        }

        if (!staleIds.isEmpty()) {
            long deleted = mongoTemplate.getCollection("course_progress")
                    .deleteMany(new Document("_id", new Document("$in", staleIds)))
                    .getDeletedCount();
            log.warn("Deduplicated course_progress records at startup. Removed {} stale documents.", deleted);
        }
    }

    private void ensureUniqueIndex() {
        Index index = new Index()
                .on("userId", Sort.Direction.ASC)
                .on("courseId", Sort.Direction.ASC)
                .named("uk_user_course_progress")
                .unique();
        mongoTemplate.indexOps("course_progress").ensureIndex(index);
    }
}
