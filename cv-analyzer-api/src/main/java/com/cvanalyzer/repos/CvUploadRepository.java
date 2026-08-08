package com.cvanalyzer.repos;

import com.cvanalyzer.entities.CvUpload;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvUploadRepository extends JpaRepository<CvUpload, Long> {
    List<CvUpload> findByUserId(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndFileName(Long userId, String Filename);
}
