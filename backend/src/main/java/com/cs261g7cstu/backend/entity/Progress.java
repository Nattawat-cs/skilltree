package com.cs261g7cstu.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "progress")
public class Progress {

    @EmbeddedId
    private ProgressId id;

    @Column(name = "done_at", nullable = false)
    private LocalDateTime doneAt;

    public Progress() {
    }

    public Progress(ProgressId id, LocalDateTime doneAt) {
        this.id = id;
        this.doneAt = doneAt;
    }

    public ProgressId getId() {
        return id;
    }

    public void setId(ProgressId id) {
        this.id = id;
    }

    public LocalDateTime getDoneAt() {
        return doneAt;
    }

    public void setDoneAt(LocalDateTime doneAt) {
        this.doneAt = doneAt;
    }
}
