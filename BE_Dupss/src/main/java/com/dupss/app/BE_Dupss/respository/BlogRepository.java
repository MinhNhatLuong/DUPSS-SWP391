package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Blog;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByAuthor(User author);
    List<Blog> findTop3ByStatusOrderByCreatedAtDesc(ApprovalStatus status);
    @Query("SELECT b FROM Blog b " +
            "WHERE b.status = com.dupss.app.BE_Dupss.entity.ApprovalStatus.APPROVED " +
            "AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR b.content LIKE CONCAT('%', :keyword, '%')) " +
            "OR b.topic.name LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            "AND (:tags IS NULL OR :tags = '' OR LOWER(b.tags) LIKE LOWER(CONCAT('%', :tags, '%')))")
    Page<Blog> search(@Param("keyword") String keyword, @Param("tags") String tags, Pageable pageable);
}
