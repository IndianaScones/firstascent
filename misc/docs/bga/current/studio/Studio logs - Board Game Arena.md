# Studio logs

> Source: http://en.boardgamearena.com/doc/Studio_logs

BGA implemented several production issues reporting tools:

- Syntax errors reporting
- Unexpected errors reporting
- Backend & frontend issues reporting

All of these are available at the bottom of your game studio page. Access your game studio page (for instance: [https://studio.boardgamearena.com/studiogame?game=xxx](https://studio.boardgamearena.com/studiogame?game=medina)) and scroll to the "**Errors in production**" block:

## BGA request&SQL logs

This log is useful:

- When you want to check what SQL requests has been built during a request.
- When you want to debug your PHP code using "self::trace"
- When you want to know why a request takes too much time.

On this log, you can see:

### Your requests

Example:

```js
 20/06 21:50:56 [info] [T403] [4/mytest0] /cinco/cinco/exchange4Cards.html?id=4&lock=97d1c7a1-903a-4d1f-8206-de39ce8204fc&table=403&testuser=4&dojo.preventCache=1371757856044
```

Note that the best way to check your Ajax request is to read the [[Input/Output section](http://en.doc.boardgamearena.com/Tools_and_tips_of_BGA_Studio#Input.2FOutput_debugging_section)].

### Request responses

Example:

```js
 20/06 21:50:56 [notice] [T403] [4/mytest0] OK-0 169 d141 c8 e0 I9 A158 V0 T0 /cinco/cinco/exchange4Cards.html?id=4&lock=97d1c7a1-903a-4d1f-8206-de39ce8204fc&table=403&testuser=4&dojo.preventCache=1371757856044
```

You can recognize a response because it contains [notice]. Usually, there is one response for each request.

Let's details the beginning of the log:

- 20/06 21:50:56: the date
- [notice]
- [T403]: this is a log from table 403
- [4/mytest0]: this is use "mytest0", with id 4
- OK-0: it means that the request ended up successfully, with no exception (expected or unexpected).
- 169: this is the time taken to process the request (169ms).
- d141: this is the total Database time used to process the request (141ms).

### SQL requests

Example:

```
 20/06 21:50:56 [info] [T403] [4/mytest0] 0.26 SELECT player_tokenColor FROM player WHERE player_id ='4'
```

All requests to Database are traced in this log. You can see here the time take by the request (0,26ms).

### Custom trace

You can use special PHP methods in your PHP code to left some trace in this log:

- $this->trace( "your message here" ); // Display "your message here" in the log
- $this->dump( "My variable", $variable_to_dump ); // Display the content of $variable_to_dump in the log

## BGA unexpected exceptions logs

In this log you can check the last Unexpected exceptions from your game.

Exceptions management on PHP side [[is described here](http://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Managing_errors_and_exceptions)].

The log displayed the complete stacktrace of the exception, so you can debug it.

The SQL log is very verbose and sometimes it too hard to extract your tracing from it, in this case you can use error log for tracing temporarily.
You can add debug statement using self::warn() which will appear in that the log. Do not leave these tracing method calls after you done debugging unless they
are real warnings or errors (only the error log level will appear in production).

## BGA Production Logs

### How to access production server exception logs

1. Navigate to your game page on the Studio website
   1. e.g. https://studio.boardgamearena.com/studiogame?game=YOURGAMEID
2. Scroll to the bottom of the page
3. Click the `Display recent errors from production` button
   1. [![Production errors buttuns.png](/images/thumb/a/a0/Production_errors_buttuns.png/458px-Production_errors_buttuns.png)](https://en.doc.boardgamearena.com/File:Production_errors_buttuns.png)

## Backend & frontend issues reporting

This is the next generation reporting tool. It is based on Sentry, a tool that aggregates any frontend and backend errors encountered by users. It allows modern statistics and gives more context.

When clicking on this button, you will be redirect to another interface that allows basic Sentry querying.

### Sentry concepts

When an error or a warning is caught, information is sent to Sentry in the form of an event, which is processed. Sentry then as the following concepts:

- **Event**: an error or warning that triggered either in the user browser or in one of BGA servers
- **Issue:** all events are attached to an issue. Sentry figures out how to merge then depending on the place the event has taken place in the code. Hence, false positive could happen
- **Issue ID**: a unique value assigned to an issue.
- **Project:** a software module. We currently have two projects that are exposed to the studio developers: *gameserver-js* (frontend) and gameserver (*backend*)
- **Tags:** metadata associated to an event, like browser version, user ID, etc. They are used to provide statistics in the issues page.
- **Release:** a release is a package name and a version name. It helps knowing when an issue appears, then narrowing down its cause. There are two releases set on BGA: mainsite release (our code) and game release (your code)

#### Views

The sentry viewer offer several views.

##### Issues list view

This is the landing view, it shows an issue list after a brief query on the Sentry server.

It is possible to filter out the project, depending on when you want to obtain frontend, backend or both errors (left red rectangle on the screenshot).

In the event of more than 25 issues, it is possible to paginate over them (right red rectangle). Ordering can also be changed, it can be:

- **number of events:** the more, the more impactful this issue is.
- **last seen:** last time an event has been added to this issue. The more ancient, the more likely it is fixed.
- **first seen:** first time an event has been recorded into this issue. This is valuable to understand when a bug was introduced (for instance, if that matches a release date)
- **trend:** Sentry "magic" ordering to determine which issues are currently gaining momentum.

[![Issues list.png](/images/thumb/2/2b/Issues_list.png/600px-Issues_list.png)](https://en.doc.boardgamearena.com/File:Issues_list.png)

Issues contain the following fields:

- **ID:** Sentry internal ID regarding this event. It is unique and starts with the project name. Hence, "`GAMESERVER-JS-XXX`" is an error related to frontend (javascript)
- **Type:** error, warning or sometimes, it contains the name of the exceptions raised
- **Description:** short description, normally the same error as the user experienced if that was not a silent error
- **Seen:** first and last times this issue has been encountered
- **Status:** number of events (🏴) and users (👤) affected by this.

Please note that we tried hard to limit false positives into this list, but, mainly for frontend errors, some errors can be "ours" and not your code. This can be guessed in the next screen if the stack is empty.

##### Issue detail view

This view shows the details of an issue. As every "specific" data is attached to an event and not an issue, this view chooses by default an event (latest one) and uses its data to fill in some fields (for instance, tags). If you navigate between events (see next view), this data is subjected to change.

[![Issue details.png](/images/thumb/7/7f/Issue_details.png/600px-Issue_details.png)](https://en.doc.boardgamearena.com/File:Issue_details.png)

This page is separated into several blocks.

###### Main information

[![Issue main informations.png](/images/thumb/c/c5/Issue_main_informations.png/300px-Issue_main_informations.png)](https://en.doc.boardgamearena.com/File:Issue_main_informations.png)

This contains the main information of the issue, as seen in issues list:

- **Type of error** (warning, error, exception name, etc.)
- **Description of error**
- **Error ID**
- More detailed information and counters:
  - **Priority:** Sentry estimate of the criticality of this issue
  - **Count:** number of events
  - **User count:** approximate number of users impacted by this issue
  - **First seen**
  - **Last seen**

###### Culprit

[![Issue culprit.png](/images/thumb/e/ef/Issue_culprit.png/300px-Issue_culprit.png)](https://en.doc.boardgamearena.com/File:Issue_culprit.png) This summarizes where and the issue happens, with a source file position and a release.

###### Stack trace

[![Issue stack trace.png](/images/thumb/0/07/Issue_stack_trace.png/300px-Issue_stack_trace.png)](https://en.doc.boardgamearena.com/File:Issue_stack_trace.png)

This block contains information particularly useful to debug an issue. By default, only stack trace elements pertaining to the game code are shown. It is possible for frontend errors to toggle this behavior and show BGA frontend stack trace elements.

Every element of the stack trace is clickable to see a hint on exactly when the execution was. Please note that some of this code is minified and hence is not very readable. However, it can still provide useful information. We plan to perhaps unminify this code later.

###### Request

[![Issue request details.png](/images/thumb/f/f3/Issue_request_details.png/300px-Issue_request_details.png)](https://en.doc.boardgamearena.com/File:Issue_request_details.png) This block contains details on the request, namely:

- **URL:** complete URL of the request, but without the query string
- **Method:** could be `GET` or `POST`
- **Query:** all query parameters if any

###### Tags

[![Issue tags.png](/images/thumb/5/5f/Issue_tags.png/300px-Issue_tags.png)](https://en.doc.boardgamearena.com/File:Issue_tags.png)

List any relevant tags regarding this event.

###### Statistics

[![Issue statistics - histogram.png](/images/thumb/0/0f/Issue_statistics_-_histogram.png/300px-Issue_statistics_-_histogram.png)](https://en.doc.boardgamearena.com/File:Issue_statistics_-_histogram.png)

This block contains an histogram of the issue events depending, either during last day or last month. Every bar is clickable.

[![Issue statistics.png](/images/thumb/c/ca/Issue_statistics.png/300px-Issue_statistics.png)](https://en.doc.boardgamearena.com/File:Issue_statistics.png)

Then, we have donuts-like statistics with a breakdown of the first 10 occurrences for:

- browsers
- device family
- OSes
- users
- tables

The more a stats impacts a browser, user or device brand, the more it is suspect that the issue is specific to them.

##### Events list view

[![Issue events list.png](/images/thumb/6/64/Issue_events_list.png/300px-Issue_events_list.png)](https://en.doc.boardgamearena.com/File:Issue_events_list.png)

When clicking on the "Other events" tab, you will see the following view, which allows you to inspect a specific event. Usually, it is not needed since default event provides enough context, but it can still be used to compare several events.
