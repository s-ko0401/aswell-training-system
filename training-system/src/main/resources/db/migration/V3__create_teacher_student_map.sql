CREATE TABLE IF NOT EXISTS teacher_student_map (
    id UUID PRIMARY KEY,
    teacher_id UUID NOT NULL,
    student_id UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE teacher_student_map
    ADD CONSTRAINT fk_teacher_student_map_teacher
        FOREIGN KEY (teacher_id) REFERENCES users (user_id);

ALTER TABLE teacher_student_map
    ADD CONSTRAINT fk_teacher_student_map_student
        FOREIGN KEY (student_id) REFERENCES users (user_id);

CREATE INDEX IF NOT EXISTS idx_teacher_student_teacher ON teacher_student_map (teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON teacher_student_map (student_id);
