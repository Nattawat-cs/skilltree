package com.cs261g7cstu.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "prerequisites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "prerequisite_id"})
)
public class Prerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "prerequisite_id", nullable = false)
    private UUID prerequisiteId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public Prerequisite() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public UUID getPrerequisiteId() {
        return prerequisiteId;
    }

    public void setPrerequisiteId(UUID prerequisiteId) {
        this.prerequisiteId = prerequisiteId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
