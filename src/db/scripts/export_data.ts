import { dbClient_ext as db, queryClient } from './client';
import { readFile } from 'fs/promises';
import { dbMode, take_input } from '~/tools/kry.server';
import { user, account, verification, complaints, notifications, actions } from '~/db/schema';
import {
  UserSchemaZod,
  AccountSchemaZod,
  VerificationSchemaZod,
  ComplaintSchemaZod,
  ActionSchemaZod,
  NotificationSchemaZod
} from '~/db/schema_zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

const main = async () => {
  /*
   Better backup & restore tools like `pg_dump` and `pg_restore` should be used.
  
   Although Here the foriegn key relations are not that complex so we are doing it manually
  */
  if (!(await confirm_environemnt())) return;

  console.log(`Insering Data into ${dbMode} Database...`);

  const in_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];

  const data = z
    .object({
      user: UserSchemaZod.array(),
      account: AccountSchemaZod.array(),
      verification: VerificationSchemaZod.array(),
      complaints: ComplaintSchemaZod.array(),
      actions: ActionSchemaZod.array(),
      notifications: NotificationSchemaZod.array()
    })
    .parse(JSON.parse((await readFile(`./out/${in_file_name}`)).toString()));

  // deleting all the tables initially
  // Using TRUNCATE CASCADE to delete all data and reset sequences, bypassing foreign key constraints
  try {
    await db.execute(
      sql`TRUNCATE TABLE "notifications", "actions", "complaints", "verification", "account", "user" RESTART IDENTITY CASCADE`
    );
    console.log(chalk.green('✓ Deleted All Tables Successfully'));
  } catch (e) {
    console.log(chalk.red('✗ Error while deleting tables:'), chalk.yellow(e));
    // console.error(e);
  }

  // inserting user
  try {
    if (data.user.length > 0) {
      await db.insert(user).values(data.user);
      console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`users`'));
    } else {
      console.log(chalk.yellow('⊘ Skipped users (empty array)'));
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting users:'), chalk.yellow(e));
    // console.error(e);
  }

  // inserting account
  try {
    if (data.account.length > 0) {
      await db.insert(account).values(data.account);
      console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`account`'));
    } else {
      console.log(chalk.yellow('⊘ Skipped account (empty array)'));
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting account:'), chalk.yellow(e));
    // console.error(e);
  }

  // inserting verification
  try {
    if (data.verification.length > 0) {
      await db.insert(verification).values(data.verification);
      console.log(
        chalk.green('✓ Successfully added values into table'),
        chalk.blue('`verification`')
      );
    } else {
      console.log(chalk.yellow('⊘ Skipped verification (empty array)'));
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting verification:'), chalk.yellow(e));
    // console.error(e);
  }

  // inserting complaints
  try {
    if (data.complaints.length > 0) {
      await db.insert(complaints).values(data.complaints);
      console.log(
        chalk.green('✓ Successfully added values into table'),
        chalk.blue('`complaints`')
      );
    } else {
      console.log(chalk.yellow('⊘ Skipped complaints (empty array)'));
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting complaints:'), chalk.yellow(e));
    // console.error(e);
  }

  // notifications
  try {
    if (data.notifications.length > 0) {
      await db.insert(notifications).values(data.notifications);
      console.log(
        chalk.green('✓ Successfully added values into table'),
        chalk.blue('`notifications`')
      );
    } else {
      console.log(chalk.yellow('⊘ Skipped notifications (empty array)'));
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting notifications:'), chalk.yellow(e));
  }

  // actions
  try {
    if (data.actions.length > 0) {
      await db.insert(actions).values(data.actions);
      console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`actions`'));
    } else {
      console.log(chalk.yellow('⊘ Skipped actions (empty array)'));
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while inserting actions:'), chalk.yellow(e));
  }

  // resetting SERIAL (not needed since TRUNCATE RESTART IDENTITY already resets sequences)
  // But if there's data, we need to set it to the max value
  try {
    if (data.notifications.length > 0) {
      await db.execute(
        sql`SELECT setval('"notifications_id_seq"', (SELECT MAX(id) FROM "notifications"))`
      );
    }
    if (data.actions.length > 0) {
      await db.execute(sql`SELECT setval('"actions_id_seq"', (SELECT MAX(id) FROM "actions"))`);
    }
  } catch (e) {
    console.log(chalk.red('✗ Error while resetting SERIAL:'), chalk.yellow(e));
  }
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure INSERT in ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
