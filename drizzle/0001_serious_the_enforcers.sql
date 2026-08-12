CREATE TABLE `anonymous_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionHash` varchar(64) NOT NULL,
	`locale` enum('ko','en','ja') NOT NULL DEFAULT 'ko',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anonymous_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `anonymous_sessions_sessionHash_unique` UNIQUE(`sessionHash`)
);
--> statement-breakpoint
CREATE TABLE `assessment_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`locale` enum('ko','en','ja') NOT NULL,
	`cesdScore` int NOT NULL,
	`pssScore` int NOT NULL,
	`mallangiType` varchar(32) NOT NULL,
	`cesdAnswers` text NOT NULL,
	`pssAnswers` text NOT NULL,
	`mallangiAnswers` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mallangi_questions` (
	`id` varchar(64) NOT NULL,
	`sortOrder` int NOT NULL,
	`questionKo` text NOT NULL,
	`questionEn` text NOT NULL,
	`questionJa` text NOT NULL,
	`optionsJson` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mallangi_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD CONSTRAINT `assessment_responses_sessionId_anonymous_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `anonymous_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assessment_responses_session_created_idx` ON `assessment_responses` (`sessionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `assessment_responses_mallangi_type_idx` ON `assessment_responses` (`mallangiType`);--> statement-breakpoint
CREATE INDEX `mallangi_questions_sort_order_idx` ON `mallangi_questions` (`sortOrder`);