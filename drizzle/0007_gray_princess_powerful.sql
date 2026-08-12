CREATE TABLE `학생_마음체크_기록` (
	`기록번호` int AUTO_INCREMENT NOT NULL,
	`학번` varchar(64) NOT NULL,
	`이름` varchar(120) NOT NULL,
	`학과` varchar(160) NOT NULL,
	`응답언어` enum('ko','en','ja') NOT NULL DEFAULT 'ko',
	`개인정보동의` boolean NOT NULL,
	`개인정보동의시각` timestamp NOT NULL,
	`상담연락동의` boolean NOT NULL DEFAULT false,
	`상담연락동의시각` timestamp,
	`우울점수` int NOT NULL,
	`스트레스점수` int NOT NULL,
	`우울응답` text NOT NULL,
	`스트레스응답` text NOT NULL,
	`만족도1` int NOT NULL DEFAULT 0,
	`만족도2` int NOT NULL DEFAULT 0,
	`만족도3` int NOT NULL DEFAULT 0,
	`만족도4` int NOT NULL DEFAULT 0,
	`만족도5` int NOT NULL DEFAULT 0,
	`만족도6` text NOT NULL,
	`제출시각` timestamp NOT NULL DEFAULT (now()),
	`수정시각` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `학생_마음체크_기록_기록번호` PRIMARY KEY(`기록번호`),
	CONSTRAINT `학생_마음체크_기록_학번_unique` UNIQUE(`학번`)
);
--> statement-breakpoint
CREATE INDEX `학생_마음체크_학과_idx` ON `학생_마음체크_기록` (`학과`);--> statement-breakpoint
CREATE INDEX `학생_마음체크_상담동의_idx` ON `학생_마음체크_기록` (`상담연락동의`);