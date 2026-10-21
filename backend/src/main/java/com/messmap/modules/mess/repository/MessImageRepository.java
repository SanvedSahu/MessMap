package com.messmap.modules.mess.repository;

import com.messmap.modules.mess.entity.MessImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Mess images and gallery.
 */
@Repository
public interface MessImageRepository extends JpaRepository<MessImage, Long> {

    List<MessImage> findByMessId(Long messId);

    Optional<MessImage> findByMessIdAndIsPrimaryTrue(Long messId);
}
