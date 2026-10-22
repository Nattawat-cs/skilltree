package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {
}
