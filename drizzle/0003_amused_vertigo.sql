CREATE TABLE `satisfaction_questions` (
	`id` varchar(64) NOT NULL,
	`sortOrder` int NOT NULL,
	`questionKo` text NOT NULL,
	`questionEn` text NOT NULL,
	`questionJa` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `satisfaction_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD `recommendedGame` varchar(32) DEFAULT 'ping-pong-bingo' NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD `satisfactionScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD `satisfactionAnswerCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD `satisfactionAnswers` text NOT NULL;--> statement-breakpoint
CREATE INDEX `satisfaction_questions_sort_order_idx` ON `satisfaction_questions` (`sortOrder`);--> statement-breakpoint
CREATE INDEX `assessment_responses_recommended_game_idx` ON `assessment_responses` (`recommendedGame`);
