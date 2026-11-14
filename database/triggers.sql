USE placement_db;

DROP TRIGGER IF EXISTS trg_after_application_selected;
DROP TRIGGER IF EXISTS trg_before_application_insert;

DELIMITER //

-- ------------------------------------------------------------
-- Keep students.is_placed, placement_history and the audit log
-- in sync whenever an application status changes.
-- ------------------------------------------------------------
CREATE TRIGGER trg_after_application_selected
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF NEW.status = 'selected' AND OLD.status <> 'selected' THEN
        UPDATE students
           SET is_placed = 1
         WHERE id = NEW.student_id;

        INSERT INTO placement_history
            (student_id, cgpa, skills_count, projects_count,
             internships_count, certifications_count, backlogs, is_placed)
        SELECT
            s.id,
            s.cgpa,
            (SELECT COUNT(*) FROM student_skills ss WHERE ss.student_id = s.id),
            s.projects_count,
            s.internships_count,
            s.certifications_count,
            s.backlogs,
            1
        FROM students s
        WHERE s.id = NEW.student_id
          AND NOT EXISTS (
              SELECT 1 FROM placement_history ph
              WHERE ph.student_id = s.id AND ph.is_placed = 1
          );
    END IF;

    IF NEW.status <> OLD.status THEN
        INSERT INTO application_log
            (application_id, old_status, new_status, changed_at, changed_by)
        VALUES
            (NEW.id, OLD.status, NEW.status, NOW(), NEW.student_id);
    END IF;
END//

-- ------------------------------------------------------------
-- Reject applications that do not satisfy the eligibility rules.
-- ------------------------------------------------------------
CREATE TRIGGER trg_before_application_insert
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE v_cgpa DECIMAL(4,2);
    DECLARE v_min_cgpa DECIMAL(4,2);
    DECLARE v_backlogs INT;
    DECLARE v_max_backlogs INT;

    SELECT cgpa, backlogs INTO v_cgpa, v_backlogs
      FROM students WHERE id = NEW.student_id;

    SELECT min_cgpa, max_backlogs INTO v_min_cgpa, v_max_backlogs
      FROM jobs WHERE id = NEW.job_id;

    IF v_cgpa IS NULL OR v_min_cgpa IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student or job does not exist';
    END IF;

    IF v_cgpa < v_min_cgpa THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student CGPA is below the job minimum CGPA requirement';
    END IF;

    IF v_backlogs > v_max_backlogs THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student exceeds the maximum allowed backlogs for this job';
    END IF;
END//

DELIMITER ;
