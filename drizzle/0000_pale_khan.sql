CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`seen` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`subject` text NOT NULL,
	`started` integer NOT NULL,
	`ended` integer,
	`seconds` integer DEFAULT 0 NOT NULL
);
