package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.BlogImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {
    List<BlogImage> findByBlogPostId(Long blogId);
}
