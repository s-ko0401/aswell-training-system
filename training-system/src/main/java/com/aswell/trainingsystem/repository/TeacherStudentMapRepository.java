package com.aswell.trainingsystem.repository;

import com.aswell.trainingsystem.domain.user.TeacherStudentMap;
import com.aswell.trainingsystem.domain.user.User;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherStudentMapRepository extends JpaRepository<TeacherStudentMap, UUID> {

    List<TeacherStudentMap> findByTeacher(User teacher);

    List<TeacherStudentMap> findByStudent(User student);
}
