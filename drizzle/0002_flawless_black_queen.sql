CREATE TABLE IF NOT EXISTS `student_assessment_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`responseId` int NOT NULL,
	`studentName` varchar(120) NOT NULL,
	`studentId` varchar(64) NOT NULL,
	`department` varchar(160) NOT NULL,
	`personalDataConsent` boolean NOT NULL,
	`personalDataConsentAt` timestamp NOT NULL,
	`counselingContactConsent` boolean NOT NULL DEFAULT false,
	`counselingContactConsentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_assessment_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_assessment_profiles_responseId_unique` UNIQUE(`responseId`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `student_assessment_profiles_student_id_idx` ON `student_assessment_profiles` (`studentId`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `student_assessment_profiles_contact_consent_idx` ON `student_assessment_profiles` (`counselingContactConsent`);
