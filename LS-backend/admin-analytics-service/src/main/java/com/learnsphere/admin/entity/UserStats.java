package com.learnsphere.admin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long totalUsers;
}
