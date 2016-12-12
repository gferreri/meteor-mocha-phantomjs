import { mochaInstance } from 'meteor/practicalmeteor:mocha-core';
import { startPhantom } from 'meteor/dispatch:phantomjs-tests';

const reporter = process.env.SERVER_TEST_REPORTER || 'spec';

// pass the current env settings to the client.
Meteor.startup(function() {
  Meteor.settings.public = Meteor.settings.public || {};
  Meteor.settings.public.CLIENT_TEST_REPORTER = process.env.CLIENT_TEST_REPORTER;
});

function printHeader(type) {
  console.log('\n--------------------------------');
  console.log(`----- RUNNING ${type} TESTS -----`);
  console.log('--------------------------------\n');
}

let clientFailures = 0;
let serverFailures = 0;

function printSummaryAndExit() {
  console.log('All client and server tests finished!\n');
    console.log('--------------------------------');
    console.log(`SERVER FAILURES: ${serverFailures}`);
    console.log(`CLIENT FAILURES: ${clientFailures}`);
    console.log('--------------------------------');
    if (!process.env.TEST_WATCH) {
      if (clientFailures + serverFailures > 0) {
        process.exit(1); // exit with non-zero status if there were failures
      } else {
        process.exit(0);
      }
    }
}

// Before Meteor calls the `start` function, app tests will be parsed and loaded by Mocha
function start() {
  // We need to set the reporter when the tests actually run to ensure no conflicts with
  // other test driver packages that may be added to the app but are not actually being
  // used on this run.
  mochaInstance.reporter(reporter);

  // Start phantom to run the client tests
  printHeader('CLIENT');
  startPhantom({
    stdout(data) {
      console.log(data.replace(/\n$/, ''));
    },
    stderr(data) {
      console.log(data.replace(/\n$/, ''));
    },
    done(failureCount) {
      clientFailures = failureCount
      // Run the server tests
      printHeader('SERVER');
      mochaInstance.run((failureCount) => {
        serverFailures = failureCount
        printSummaryAndExit()
      });
    },
  });
}

export { start };
