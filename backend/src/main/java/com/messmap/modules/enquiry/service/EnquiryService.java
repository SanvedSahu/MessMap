package com.messmap.modules.enquiry.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.enquiry.dto.CreateEnquiryRequest;
import com.messmap.modules.enquiry.dto.EnquiryResponse;
import com.messmap.modules.enquiry.dto.ReplyEnquiryRequest;
import com.messmap.modules.enquiry.entity.Enquiry;
import com.messmap.modules.enquiry.entity.EnquiryStatus;
import com.messmap.modules.enquiry.repository.EnquiryRepository;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Service managing student-to-mess enquiries with strict server-side authorization.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final MessRepository messRepository;
    private final UserRepository userRepository;

    /**
     * Submit an enquiry for a specific mess by the authenticated student.
     */
    @Transactional
    public EnquiryResponse createEnquiry(Long studentId, CreateEnquiryRequest request) {
        log.info("Student id={} submitting enquiry for mess id={}", studentId, request.getMessId());

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found with id: " + studentId));

        Mess mess = messRepository.findById(request.getMessId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + request.getMessId()));

        if (mess.getStatus() != MessStatus.APPROVED) {
            throw new BadRequestException("Enquiries can only be submitted for approved mess listings");
        }

        String studentName = (request.getStudentName() != null && !request.getStudentName().isBlank())
                ? request.getStudentName().trim()
                : student.getName();

        String studentEmail = student.getEmail();

        String studentPhone = (request.getStudentPhone() != null && !request.getStudentPhone().isBlank())
                ? request.getStudentPhone().trim()
                : student.getPhone();

        String studentCollege = (request.getStudentCollege() != null && !request.getStudentCollege().isBlank())
                ? request.getStudentCollege().trim()
                : student.getCollege();

        Enquiry enquiry = Enquiry.builder()
                .mess(mess)
                .student(student)
                .studentName(studentName)
                .studentEmail(studentEmail)
                .studentPhone(studentPhone)
                .studentCollege(studentCollege)
                .category(request.getCategory().trim())
                .planType(request.getPlanType() != null ? request.getPlanType().trim() : null)
                .message(request.getMessage().trim())
                .status(EnquiryStatus.NEW)
                .build();

        Enquiry saved = enquiryRepository.save(enquiry);
        log.info("Successfully created enquiry id={} for mess id={} by student id={}", saved.getId(), mess.getId(), studentId);
        return EnquiryResponse.fromEntity(saved);
    }

    /**
     * Retrieve all enquiries submitted by the authenticated student.
     */
    @Transactional(readOnly = true)
    public List<EnquiryResponse> getStudentEnquiries(Long studentId) {
        log.info("Fetching enquiries for student id={}", studentId);
        List<Enquiry> list = enquiryRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return list.stream().map(EnquiryResponse::fromEntity).toList();
    }

    /**
     * Retrieve enquiries for a mess owned by the authenticated owner.
     * Enforces that an owner can only view enquiries for their own mess.
     */
    @Transactional(readOnly = true)
    public List<EnquiryResponse> getOwnerEnquiries(Long ownerId, Long messId, EnquiryStatus status, boolean isAdmin) {
        log.info("Fetching enquiries for owner id={}, messId={}, status={}, isAdmin={}", ownerId, messId, status, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin);

        List<Enquiry> list;
        if (status != null) {
            list = enquiryRepository.findByMessIdAndStatusOrderByCreatedAtDesc(mess.getId(), status);
        } else {
            list = enquiryRepository.findByMessIdOrderByCreatedAtDesc(mess.getId());
        }

        return list.stream().map(EnquiryResponse::fromEntity).toList();
    }

    /**
     * Mark an enquiry as replied and save owner response notes.
     */
    @Transactional
    public EnquiryResponse replyEnquiry(Long ownerId, Long enquiryId, ReplyEnquiryRequest request, boolean isAdmin) {
        log.info("Owner id={} replying to enquiry id={}", ownerId, enquiryId);

        Enquiry enquiry = enquiryRepository.findByIdWithMessAndOwner(enquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found with id: " + enquiryId));

        Mess mess = enquiry.getMess();
        if (!isAdmin && (mess.getOwner() == null || !mess.getOwner().getId().equals(ownerId))) {
            throw new AccessDeniedException("Access denied: You are not authorized to view or respond to enquiries for another owner's mess.");
        }

        enquiry.setStatus(EnquiryStatus.REPLIED);
        enquiry.setReplyNotes(request.getReplyNotes() != null ? request.getReplyNotes().trim() : null);
        enquiry.setResolvedAt(LocalDateTime.now());

        Enquiry updated = enquiryRepository.save(enquiry);
        log.info("Successfully replied to enquiry id={}", updated.getId());
        return EnquiryResponse.fromEntity(updated);
    }

    private Mess resolveTargetMess(Long ownerId, Long messId, boolean isAdmin) {
        if (messId != null) {
            Mess mess = messRepository.findByIdWithDetails(messId)
                    .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));
            if (!isAdmin && (mess.getOwner() == null || !mess.getOwner().getId().equals(ownerId))) {
                throw new AccessDeniedException("Access denied: You are not authorized to access enquiries for another owner's mess.");
            }
            return mess;
        }

        List<Mess> messes = messRepository.findByOwnerIdWithDetails(ownerId);
        if (messes.isEmpty()) {
            throw new ResourceNotFoundException("No mess listing found for owner id: " + ownerId);
        }
        return messes.get(0);
    }
}
