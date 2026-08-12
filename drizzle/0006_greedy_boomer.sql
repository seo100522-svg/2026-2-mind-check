CREATE TABLE `student_assessment_current` (
	`studentId` varchar(64) NOT NULL,
	`responseId` int NOT NULL,
	`studentName` varchar(120) NOT NULL,
	`department` varchar(160) NOT NULL,
	`personalDataConsent` boolean NOT NULL,
	`personalDataConsentAt` timestamp NOT NULL,
	`counselingContactConsent` boolean NOT NULL DEFAULT false,
	`counselingContactConsentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_assessment_current_studentId` PRIMARY KEY(`studentId`),
	CONSTRAINT `student_assessment_current_responseId_unique` UNIQUE(`responseId`)
);
--> statement-breakpoint
CREATE INDEX `student_assessment_current_department_idx` ON `student_assessment_current` (`department`);--> statement-breakpoint
CREATE INDEX `student_assessment_current_contact_consent_idx` ON `student_assessment_current` (`counselingContactConsent`);