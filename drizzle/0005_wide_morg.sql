CREATE TABLE `station_settings` (
	`settingKey` varchar(64) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `station_settings_settingKey` PRIMARY KEY(`settingKey`)
);
--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD `satisfactionComment` text;--> statement-breakpoint
ALTER TABLE `satisfaction_questions` ADD `questionType` enum('likert','textarea') DEFAULT 'likert' NOT NULL;