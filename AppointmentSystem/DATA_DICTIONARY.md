# Data Dictionary - Appointment Management System

## Overview
This document describes the database structure for the Firebase-based appointment management system. The system manages appointments between students and lecturers, with administrative oversight.

**Database Type**: Firebase Firestore (NoSQL Document Database)
**Project ID**: appointment-management-c2531

---

## Collections Overview

| Collection | Description | Document ID Pattern |
|------------|-------------|-------------------|
| `students` | Student user accounts | Email address |
| `lecturers` | Lecturer user accounts | Email address |
| `admins` | Administrator accounts | Email address |
| `faculties` | Faculty/department information | Faculty code |
| `appointments` | Appointment records | Auto-generated |
| `appointment_slots` | Available time slots | Auto-generated |
| `appointment_requests` | Student requests for changes | Auto-generated |
| `slot_requests` | Student requests for new slots | Auto-generated |
| `inquiries` | Student/lecturer inquiries | Auto-generated |
| `notifications` | In-app notifications | Auto-generated |
| `announcements` | System announcements | Auto-generated |
| `emailOtps` | OTP codes for authentication | Email address |

---

## Detailed Collection Schemas

### 1. Students Collection (`students`)
**Purpose**: Stores student user information and profiles
**Document ID**: Student's email address

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `id` | String | Yes | Student ID number | Unique identifier |
| `name` | String | Yes | Full name | 1-100 characters |
| `email` | String | Yes | Email address (document ID) | Valid email format |
| `faculty` | String | Yes | Faculty code | References `faculties` |
| `contact` | String | No | Phone number | Format: +60xxxxxxxxx |
| `avatarUrl` | String | No | Profile picture URL | Firebase Storage URL |
| `role` | String | Yes | User role | Fixed value: "student" |
| `createdBy` | String | No | Admin who created account | References `admins` |
| `createdAt` | Timestamp | No | Account creation date | Auto-generated |
| `updatedAt` | Timestamp | No | Last update date | Auto-generated |

### 2. Lecturers Collection (`lecturers`)
**Purpose**: Stores lecturer user information and profiles
**Document ID**: Lecturer's email address

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `id` | String | Yes | Lecturer ID number | Unique identifier |
| `name` | String | Yes | Full name | 1-100 characters |
| `email` | String | Yes | Email address (document ID) | Valid email format |
| `faculty` | String | Yes | Faculty code | References `faculties` |
| `office` | String | No | Office location | Format: [Faculty][Room] |
| `contact` | String | No | Phone number | Format: +60xxxxxxxxx |
| `avatarUrl` | String | No | Profile picture URL | Firebase Storage URL |
| `role` | String | Yes | User role | Fixed value: "lecturer" |
| `createdBy` | String | No | Admin who created account | References `admins` |
| `createdAt` | Timestamp | No | Account creation date | Auto-generated |
| `updatedAt` | Timestamp | No | Last update date | Auto-generated |

### 3. Admins Collection (`admins`)
**Purpose**: Stores administrator user information and permissions
**Document ID**: Admin's email address

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `name` | String | Yes | Full name | 1-100 characters |
| `email` | String | Yes | Email address (document ID) | Valid email format |
| `phone` | String | No | Phone number | Format: +60xxxxxxxxx |
| `department` | String | No | Department name | Administrative department |
| `role` | String | Yes | User role | Fixed value: "admin" |
| `isSuper` | Boolean | No | Super admin flag | Default: false |
| `createdAt` | Timestamp | No | Account creation date | Auto-generated |
| `updatedAt` | Timestamp | No | Last update date | Auto-generated |
| `updatedBy` | String | No | Admin who made changes | References `admins` |

### 4. Faculties Collection (`faculties`)
**Purpose**: Stores faculty/department information
**Document ID**: Faculty code

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `name` | String | Yes | Faculty full name | 1-200 characters |
| `createdBy` | String | No | Admin who created faculty | References `admins` |
| `createdAt` | Timestamp | No | Creation date | Auto-generated |
| `updatedAt` | Timestamp | No | Last update date | Auto-generated |

### 5. Appointments Collection (`appointments`)
**Purpose**: Stores appointment records between students and lecturers
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `studentEmail` | String | Yes | Student's email | References `students` |
| `studentName` | String | Yes | Student's name | For display purposes |
| `studentId` | String | Yes | Student ID | For reference |
| `lecturerEmail` | String | Yes | Lecturer's email | References `lecturers` |
| `lecturerName` | String | Yes | Lecturer's name | For display purposes |
| `slotId` | String | Yes | Associated slot ID | References `appointment_slots` |
| `date` | String | Yes | Appointment date | Format: YYYY-MM-DD |
| `startTime` | String | Yes | Start time | Format: HH:MM |
| `endTime` | String | Yes | End time | Format: HH:MM |
| `purpose` | String | Yes | Appointment purpose | 1-500 characters |
| `notes` | String | No | Additional notes | Up to 1000 characters |
| `documents` | Array | No | Attached documents | Array of file objects |
| `status` | String | Yes | Appointment status | pending, approved, cancelled, completed |
| `bookedAt` | String | Yes | Booking timestamp | ISO date string |
| `lastModified` | String | No | Last modification date | ISO date string |
| `cancelledAt` | String | No | Cancellation timestamp | ISO date string |
| `cancelledBy` | String | No | Who cancelled | student or lecturer |
| `cancellationReason` | String | No | Reason for cancellation | Up to 500 characters |

#### Document Sub-objects:
**documents** array contains objects with:
- `name` (String): Original filename
- `url` (String): Firebase Storage URL
- `type` (String): MIME type
- `size` (Number): File size in bytes

### 6. Appointment_Slots Collection (`appointment_slots`)
**Purpose**: Stores available time slots created by lecturers
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `lecturerEmail` | String | Yes | Lecturer's email | References `lecturers` |
| `lecturerName` | String | No | Lecturer's name | For display purposes |
| `date` | String | Yes | Slot date | Format: YYYY-MM-DD |
| `startTime` | String | Yes | Start time | Format: HH:MM |
| `endTime` | String | Yes | End time | Format: HH:MM |
| `isBooked` | Boolean | Yes | Booking status | Default: false |
| `bookedBy` | String | No | Student who booked | References `students` |
| `createdAt` | String | Yes | Creation timestamp | ISO date string |
| `maxDuration` | Number | No | Maximum duration (minutes) | Default: 60 |

### 7. Appointment_Requests Collection (`appointment_requests`)
**Purpose**: Stores student requests for appointment changes
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `appointmentId` | String | Yes | Related appointment ID | References `appointments` |
| `studentEmail` | String | Yes | Student's email | References `students` |
| `studentName` | String | Yes | Student's name | For display purposes |
| `lecturerEmail` | String | Yes | Lecturer's email | References `lecturers` |
| `requestType` | String | Yes | Type of request | reschedule, cancel |
| `currentDate` | String | Yes | Current appointment date | Format: YYYY-MM-DD |
| `currentStartTime` | String | Yes | Current start time | Format: HH:MM |
| `currentEndTime` | String | Yes | Current end time | Format: HH:MM |
| `newDate` | String | No | Requested new date | Format: YYYY-MM-DD |
| `newStartTime` | String | No | Requested new start time | Format: HH:MM |
| `newEndTime` | String | No | Requested new end time | Format: HH:MM |
| `reason` | String | Yes | Reason for request | 1-500 characters |
| `status` | String | Yes | Request status | pending, approved, rejected |
| `requestedAt` | String | Yes | Request timestamp | ISO date string |
| `respondedAt` | String | No | Response timestamp | ISO date string |

### 8. Slot_Requests Collection (`slot_requests`)
**Purpose**: Stores student requests for new appointment slots
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `studentEmail` | String | Yes | Student's email | References `students` |
| `studentName` | String | Yes | Student's name | For display purposes |
| `studentId` | String | Yes | Student ID | For reference |
| `lecturerEmail` | String | Yes | Lecturer's email | References `lecturers` |
| `lecturerName` | String | Yes | Lecturer's name | For display purposes |
| `preferredDate` | String | Yes | Preferred date | Format: YYYY-MM-DD |
| `startTime` | String | Yes | Preferred start time | Format: HH:MM |
| `endTime` | String | Yes | Preferred end time | Format: HH:MM |
| `purpose` | String | Yes | Purpose of appointment | 1-500 characters |
| `notes` | String | No | Additional notes | Up to 1000 characters |
| `status` | String | Yes | Request status | pending, accepted, rejected |
| `requestedAt` | String | Yes | Request timestamp | ISO date string |
| `respondedAt` | String | No | Response timestamp | ISO date string |

### 9. Inquiries Collection (`inquiries`)
**Purpose**: Stores student and lecturer inquiries to administrators
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `userEmail` | String | Yes | Inquirer's email | References users |
| `userName` | String | Yes | Inquirer's name | For display purposes |
| `userType` | String | Yes | User type | student, lecturer |
| `category` | String | Yes | Inquiry category | technical, academic, general |
| `subject` | String | Yes | Inquiry subject | 1-200 characters |
| `description` | String | Yes | Inquiry description | 1-2000 characters |
| `priority` | String | Yes | Priority level | low, medium, high |
| `status` | String | Yes | Inquiry status | open, in_progress, resolved, closed |
| `attachmentUrl` | String | No | Attachment file URL | Firebase Storage URL |
| `attachmentName` | String | No | Original filename | For display purposes |
| `createdAt` | Timestamp | Yes | Creation timestamp | Server timestamp |
| `updatedAt` | Timestamp | Yes | Last update timestamp | Server timestamp |

#### Legacy Response Fields (for backward compatibility):
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `response` | String | No | Admin response | Legacy field |
| `responseDate` | Timestamp | No | Response date | Legacy field |
| `respondedBy` | String | No | Admin who responded | Legacy field |
| `userResponse` | String | No | User follow-up | Legacy field |
| `userResponseDate` | Timestamp | No | User response date | Legacy field |

#### Conversation Thread:
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `conversation` | Array | No | Message thread | Array of message objects |

**conversation** array contains objects with:
- `type` (String): Message type - "admin" or "user"
- `message` (String): Message content
- `timestamp` (Timestamp): Message timestamp
- `author` (String): Message author name
- `isAdmin` (Boolean): Whether sender is admin

### 10. Notifications Collection (`notifications`)
**Purpose**: Stores in-app notifications for users
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `userEmail` | String | Yes | Recipient's email | References users |
| `userType` | String | Yes | Recipient type | student, lecturer, admin |
| `type` | String | Yes | Notification type | See notification types |
| `title` | String | Yes | Notification title | 1-200 characters |
| `message` | String | Yes | Notification message | 1-500 characters |
| `icon` | String | No | FontAwesome icon class | e.g., "fa-calendar" |
| `category` | String | No | Notification category | Appointments, Inquiries, System |
| `read` | Boolean | Yes | Read status | Default: false |
| `timestamp` | Timestamp | Yes | Creation timestamp | Server timestamp |
| `createdAt` | Timestamp | Yes | Creation timestamp | Server timestamp |

#### Notification Types:
- `lecturer_approved_appointment`
- `lecturer_rejected_appointment`
- `lecturer_cancelled_appointment`
- `student_booked_slot`
- `student_requested_slot`
- `student_cancel_request`
- `student_reschedule_request`
- `appointment_reminder`
- `inquiry_response`
- `system_announcement`

### 11. Announcements Collection (`announcements`)
**Purpose**: Stores system-wide announcements
**Document ID**: Auto-generated

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `title` | String | Yes | Announcement title | 1-200 characters |
| `content` | String | Yes | Announcement content | 1-5000 characters |
| `priority` | String | Yes | Priority level | low, medium, high |
| `pictureUrl` | String | No | Attached image URL | Firebase Storage URL |
| `createdAt` | Timestamp | Yes | Creation timestamp | Server timestamp |
| `createdBy` | String | Yes | Admin who created | References `admins` |

### 12. EmailOtps Collection (`emailOtps`)
**Purpose**: Stores OTP codes for email authentication
**Document ID**: User's email address

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `code` | String | Yes | 6-digit OTP code | Generated code |
| `created` | Timestamp | Yes | Creation timestamp | Server timestamp |

**Note**: Documents auto-delete after 5 minutes for security.

---

## Relationships and Constraints

### Primary Relationships:
1. **Students → Appointments**: One-to-Many (studentEmail)
2. **Lecturers → Appointments**: One-to-Many (lecturerEmail)
3. **Lecturers → Appointment_Slots**: One-to-Many (lecturerEmail)
4. **Appointments → Appointment_Slots**: Many-to-One (slotId)
5. **Faculties → Students**: One-to-Many (faculty)
6. **Faculties → Lecturers**: One-to-Many (faculty)
7. **Admins → Faculties**: One-to-Many (createdBy)

### Business Rules:
1. **Appointment Booking**: Students can only book available slots (isBooked = false)
2. **Slot Management**: Only lecturers can create/manage their own slots
3. **User Management**: Only admins can create/modify user accounts
4. **Inquiry System**: Students and lecturers can create inquiries; only admins can respond
5. **Notification System**: Automatic notifications sent for all appointment-related actions
6. **File Storage**: All file uploads limited to 5MB per file
7. **Data Integrity**: Cascade deletion rules apply when admins delete slots

### Security Rules:
1. **Authentication**: OTP-based email authentication required
2. **Authorization**: Role-based access control (student/lecturer/admin)
3. **Data Privacy**: Users can only access their own data
4. **Admin Privileges**: Super admins have additional permissions
5. **File Access**: Document attachments accessible only to appointment participants

---

## Data Validation Rules

### Common Field Validations:
- **Email fields**: Must be valid email format
- **Date fields**: Must be in YYYY-MM-DD format
- **Time fields**: Must be in HH:MM format (24-hour)
- **Phone numbers**: Must follow +60xxxxxxxxx format
- **File uploads**: Maximum 5MB per file
- **Text fields**: HTML tags stripped, XSS prevention

### Status Field Values:
- **Appointment Status**: pending, approved, cancelled, completed
- **Request Status**: pending, approved, rejected, accepted
- **Inquiry Status**: open, in_progress, resolved, closed
- **Priority Levels**: low, medium, high

### Timestamp Handling:
- **Server Timestamps**: Used for all creation/update times
- **ISO Strings**: Used for display and client-side operations
- **Timezone**: All times stored in system timezone (UTC+8)

---

## Storage Structure

### Firebase Storage Paths:
```
/appointments/{userEmail}/{filename}     # Appointment documents
/inquiries/{timestamp}_{filename}        # Inquiry attachments
/avatars/students/{userEmail}/{filename} # Student avatars
/avatars/lecturers/{userEmail}/{filename}# Lecturer avatars
/announcements/{timestamp}_{filename}    # Announcement images
```

### File Naming Convention:
- **Pattern**: `{timestamp}_{sanitized_filename}`
- **Sanitization**: Replace special characters with underscores
- **Uniqueness**: Timestamp prefix ensures unique filenames

---

## Performance Considerations

### Indexing Strategy:
- **Composite Indexes**: Created for common query patterns
- **Single Field Indexes**: Auto-created by Firestore
- **Query Optimization**: Limit results and use pagination where needed

### Common Query Patterns:
1. **User Appointments**: `appointments` WHERE `userEmail` = ? ORDER BY `date`
2. **Available Slots**: `appointment_slots` WHERE `isBooked` = false AND `date` >= today
3. **User Notifications**: `notifications` WHERE `userEmail` = ? ORDER BY `timestamp` DESC
4. **Pending Requests**: `appointment_requests` WHERE `status` = 'pending'

---

## Data Retention Policy

### Automatic Cleanup:
- **OTP Codes**: 5-minute expiration
- **Completed Appointments**: Retained for 2 years
- **Cancelled Appointments**: Retained for 1 year
- **Resolved Inquiries**: Retained for 1 year
- **Read Notifications**: 30-day retention
- **File Attachments**: Linked to parent document lifecycle

### Manual Cleanup:
- **User Accounts**: Require admin approval for deletion
- **Sensitive Data**: Secure deletion process for GDPR compliance
- **Audit Logs**: System maintains audit trail for administrative actions

---

## System Metadata

- **Last Updated**: 2025-01-16
- **Database Version**: 1.0
- **Firebase Project**: appointment-management-c2531
- **Region**: asia-southeast1 (Singapore)
- **Backup Schedule**: Daily automated backups
- **Security Rules**: Updated monthly

---

*This data dictionary is maintained by the development team and should be updated whenever schema changes are made.* 