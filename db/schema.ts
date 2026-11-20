import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const people=sqliteTable('people',{id:text('id').primaryKey(),name:text('name').notNull(),seen:integer('seen').notNull()});
export const sessions=sqliteTable('sessions',{id:text('id').primaryKey(),user:text('user').notNull(),subject:text('subject').notNull(),started:integer('started').notNull(),ended:integer('ended'),seconds:integer('seconds').notNull().default(0)});
