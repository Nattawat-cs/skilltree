package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByStudentId(String studentId);
}
