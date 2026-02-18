package com.learnsphere.discussion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="discussion_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscussionPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;

    private Long userId;

    private String message;

    private Long parentId; // null = thread, otherwise reply
}
