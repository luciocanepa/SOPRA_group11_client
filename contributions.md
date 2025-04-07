# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 24.03.2025 to 30.03.2025

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@annapangUZH** | 30.03.2025   | I used multiple commits per contribution, I have enumerated them.<br/>Commit 1.1: <https://github.com/luciocanepa/SOPRA_group11_client/commit/e83873bd5e9276057efac216ac14bc9a64a44fdb><br/>Commit 1.2: <https://github.com/luciocanepa/SOPRA_group11_client/commit/718088889c211c18dbaa7c7fad1631aa0bed97db><br/>Commit 1.3: <https://github.com/luciocanepa/SOPRA_group11_client/commit/42f6ba7635b0eb0f985ffa3a36759d2a9de6b119> | I created the register page, where a user can register with a username and password to get to the dashboard. They can also go to the log-in page. It corresponds to issue #9. | This contribution ensures that a user can register and create an account to access the Pomodoro Study Room and all its functionalities. |
|                    | 30.03.2025   | Commit 2.1: <https://github.com/luciocanepa/SOPRA_group11_client/commit/8e4e7963207b1a66f336b8d05fe74947168082a3><br/>Commit 2.2: <https://github.com/luciocanepa/SOPRA_group11_client/commit/09184da41a987199a41ad38fe358bdd35836d20f><br/>Commit 2.3: <https://github.com/luciocanepa/SOPRA_group11_client/commit/56c549a2475b1ec73e4fdac647ef9f67965e35c6> | I created a hook and component for User Status Updates in real time using Websockets. The client gets constant updates of user status and displays them in real-time. It corresponds to issue #1. | This contribution ensures collaboration: users can view the status of group members in order to stay informed about the members' availability to chat, sync breaks, or study together. |
| **@sharonisler** | 30.03.2025   | <https://github.com/luciocanepa/SOPRA_group11_client/commit/5e3502fb26f19ff9d634ca66eacdff1c13d72388> | I made a group registration form, where a user can enter all the necessary credentials (images are stored as base64 strings). The group.css file stores all the styling formats (color, background, containers etc.) Upon creating the group we currently get redirected to the dashboard page. | Creating a group is important for the collaborative aspect of our project. |
|                    | 30.03.2025   | <https://github.com/luciocanepa/SOPRA_group11_client/commits/dashboard/> | I made the dashboard which has buttons directing us to statistics, pomodoro timer, profile edit page and one which will handle the logout of the user directing us to the login page. The last element of this dashboard is the group container. This should (always) display the button „create new user“ which will lead to the group registration form. And additionally if the user already is member of some groups, they will also be displayed in here. The functionality of it: fetching the user that is logged in, then fetching all groups and check for each if the user id appears in the list of group-members. Also the dashboard.css that contains all the styles for this UI | This is relevant since our logged in users need a welcome/overview page. |
| **@HelinCapan** | 30.03.2025   | [Link Timer Commit 1.1](https://github.com/luciocanepa/SOPRA_group11_client/commit/4ffb698ca420887dd967f78c8d74935b14c50254) | I have made a pomodoro timer with start, stop, reset buttons. The implementation also includes a “timer settings” button with which the user can change the interval times. I also added an alarm that rings when each study/break session ends. Issue Nr: 7 | The timer is the heart piece of our WebApp and ensures that the Users have a working and useable timer for their studies. This will be used in the group dashboard. |
|                    | 30.03.25   | [Link Timer Commit 1.2](https://github.com/luciocanepa/SOPRA_group11_client/commit/f92593cea1b1eea6a3a1a690dac38df9f6047d5e)  | see above - this was mostly a major rework of the design. Issue Nr: 7 | Better UI. This contribution aims and ensures to make the timer UI look like the mockup while ensuring its functionalities work. |
| **@HelinCapan** | 30.03.2025   | [Link Participants Commit](https://github.com/luciocanepa/SOPRA_group11_client/commit/d7e4e22b4cc277dcb5fe11c643c7819aa6d6f455) | I have made the specific groups participants/group members display; showing the user and their status. Issue Nr: 5 | This contribution gives users the ability to check who is in their study group, making the webapp more interactive. This will also be useful for the admin. This will also be used in the group dashboard (when break). |
| **@luciocanepa** | 28.03.2025   | [Link to group creation commit](https://github.com/luciocanepa/SOPRA_group11_server/commit/6312fb00f9f1934a7772cffeb90893d63676fc10) (#40) | Added support for groups, specifically the following API endpoints:<br>- GET /groups : returns a list of all groups (users has only the id of the groups it's part of)<br>- GET /groups/{gid} : returns the group by id<br>- POST /groups : create a new group (gets at least the name of the group and the id of the admin user)<br>- POST /groups/{gid} : adds a new user to the group with id gid (only needs as body variable the user id)<br>In order to have a many-to-many relation between users and groups, the DB create an additional table "group_users" that stores in 2 columns id of users and groups in relation. API calls are not affected by this | This commit creates 2 additional tables on the server and offers endpoints to the client, which is now able to create groups, add users to groups and retrieve information about groups. |
| **@luciocanepa** | 30.03.2025   | [Link to group testing commit](https://github.com/luciocanepa/SOPRA_group11_server/commit/89b2325fffdf148ed2e7ef3bc30cb5cac44a1270) (#44) | Added tests for groups implemented endpoints, especially tests for the files:<br>- group repository<br>- group service (and integration)<br>- group controller<br>In order to do I add to add an equal() method on the user object, in order to be able to compare users.<br>Minor improvements on the internal functioning of groups have been added. | The tests written assses that the group creation commit ([Link to group creation commit](https://github.com/luciocanepa/SOPRA_group11_server/commit/6312fb00f9f1934a7772cffeb90893d63676fc10)) works properly. Furthermore it allowd me to better structure some functions. |
| **@moritzboet** | 26.03.2025   | [Link to user creation](https://github.com/luciocanepa/SOPRA_group11_server/commit/553bcdd891b63ac3b5930922332a81c764a3fb9b) (#22) | I added the API endpoint for the register and for that made some changes to the post and get dto and mapper. I also changes the createUser in UserService and the user class to support having a password and not have a name anymore. close #22 | this commit lets you create a user |
|                    | 27.03.2025   | [Link to Commit for user creation testing](https://github.com/luciocanepa/SOPRA_group11_server/commit/6f1fa2bacd553cd35a3f2ba4f5219ba04fa09b69) (#23)| I made sure to correct all test that were currently thre to fit to the current state of the code. That involved removing everything related to the name of the user, since our users just have a username. i also added the password to parts where it is needed. since a user is automatically logged in after register i set the status of a user to online in my last commit, therefore i also changed the test to check for this instead of offline. in addition to this i also added a new test to the UserController, that checks for the correct response for a invalid request. close #23 | this commit lets you verify the correctness of the user creation |
| | 30.03.2025   | [Link to Commit for user login](https://github.com/luciocanepa/SOPRA_group11_server/commit/8584bb4c8f2b06aa4469109173ce5f05fd7e634e) (#25) | added the /useres/login API endpont to the userController and in the Userservice a function to handle the login called loginUser. I also made a function for switching userstatus and moved the hashing for the password into a seperate function. secure password handling still has to be looked at with group. close #25 | this commit is important so that the user login can be handled |

---

## Contributions Week 2 - 31.03.2025 to 06.04.2025

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **annapangUZH** | 03.04.2025   | [[Link to Commit 1]](https://github.com/luciocanepa/SOPRA_group11_client/commit/31f717b63d50b8cdd819ad08ac353d59d01be189) | I changed the realTimeStatus branch and the WebSocket. Now instead of only updating statuses of users, it handles updates to all group-related stuff, like updates to the group name, description, or if a member changes the username or the status changes. | This ensures that users will see real time updates of changes, including status changes, without having to constantly refresh the page. |
|                    | 05.04.2025   | <https://github.com/luciocanepa/SOPRA_group11_server/commit/e9718c9b67a104aeee80f8093620a0f45be23402> | I added an endpoint (/users/{id}/groups) that handles the fetching of groups if given a user Id (based on the user Id, it returns all groups the user is a part of) | This ensures that the call to get all groups of a specific user is isolated and handled directly by one single endpoint, which makes getting the groups for a user much easier, especially for the dashboard. |
|                    | 06.04.2025   | <https://github.com/luciocanepa/SOPRA_group11_server/commit/e369fdd8d1a7bd9ba2f63af6ee909bd2327a77cc> | I added tests (unit, integration, and controller) for fetching groups based on a user Id, adding tests for success, failure and an edge case. | The tests make sure that the endpoint /users/{id}/groups works as intended. |
| **@luciocanepa** | 05.04.2025   | [#43 Manage groups invitations](https://github.com/luciocanepa/SOPRA_group11_server/commit/e7c2b00117199c055fd1848100b7d020de944a36) | Manage groups invitation:<br>- users that are part of a group can invite an user<br>- invited users are able to visualize all invitations and either accept it or reject it<br>- groups can see all active members and retrieve all pending invitations<br>I've managed to keep one single extra table to do so, and specifically implemented the endpoints:<br>- POST /groups/{gid}/invitations to invite an user to a group (user ID is a body parameter)<br>- GET /groups/{gid}/invitations to get all invitations of a group (no body)<br>- GET /users/{user_id}/invitations to get all invitations of a user (no body)<br>- PUT /invitations/{iid}/accept to accept a specific invitation based on id<br>- PUT /invitations/{iid}/reject to reject a specific invitation based on id<br>All 5 mappsing requires a token to be passed in the header (Authorization: <token>) of the user making the API call this serves to identify it, retrieve information about it and decide if it can do that call | Now users that are part of groups can send invitations to other users to join. Who gets invited can decide to either accept (gets added to the group) or reject. The users-groups relation is stored in a table on the server that keeps track of the relations status|
| **@luciocanepa** | 05.04.2025   | [#41 Tests for groups invitations](https://github.com/luciocanepa/SOPRA_group11_server/commit/aabcbd845e1ad376b7d2e3557d7b6ffd149ec551) | Added tests for groups invitations and newly introduced endpoints:<br>- InvitationService tests (and integration)<br>- added tests for DTO Mapper<br>- updated group related tests such that they are now compatible with the new joined table | For each endpoint and implemented function, a test is written and enusre the correct behaviour for the succes case and all different kinds of error the function can return.|
| **@sharonisler** | 06.04.2025   | [Commit 1, Issue28 server](https://github.com/luciocanepa/SOPRA_group11_server/commit/49a7259bc280b24a6688325a7019a90ebeae3611) | I added the endpoint that returns one user especially for the edit page (ManageProfileDTO) and an endpoint to store the new user values (including username, name, password, birthday, timezone and profilePicture) of the user (UserPutDTO). | This contribution is needed in order to process the user profile management, new user values can now be changed and stored. |
| **@sharonisler** | 06.04.2025   | [Commit 2, Issue8 client](https://github.com/luciocanepa/SOPRA_group11_client/commit/db26f965e5e0ebdc6073209ca148d1b9d9aaeec0) | I made a UI for Profile Management. The user can oversee their profile and edit the values they would like to change. All users have the same initial profile picture if they have not uploaded one themselves. The user information should be prefilled in the Form and are only editable by clicking on the edit button (pen). To enter your birthday you are able to choose the Date in a calendar, instead of having to type in a correct format, as well as the timezones, they are selectable from a certain selection of timezones. | This contribution is needed so logged in users can oversee their profile data, as well as editing their profile. |
| **@sharonisler** | 06.04.2025   | [Commit 3, Issue3 client](https://github.com/luciocanepa/SOPRA_group11_client/commit/d55ae9ee7f862f57b471349543dc9feb978f9600) [Commit 4, Issue6 client](https://github.com/luciocanepa/SOPRA_group11_client/commit/58369597f47b5445b89de9da6963b79a0d6f48f8) | I had to change some things regarding the admin Id, and the general styling of this group creation form. I had to change the handleLogout() so the status can be set to offline on the server part. The size of the box does not jump anymore when hovering over a group card. I also changed how the users’ groups get fetched and displayed, however this can and possibly should be improved again with the newly added endpoints from the server side.  | Both of these commits are fixes/improvements to my commit from last week. |
| **HelinCapan** | 06.04.2025   | [#7 Commit Timer UI Redo](https://github.com/luciocanepa/SOPRA_group11_client/commit/dc600fc0d18534e98693a581b7fbb69e3db8c2c0) | changed Pomodoro timer with improved state management and validation, Consolidated state into TimerState interface, Fixed audio playback for sessions & breaks, Enforced whole-number inputs (min 1 minute), Added example page (/timerexampleuse)| The single state version (TimerState interface) makes creating multiple independent timer instances for different users easier, as each instance cleanly manages its own state without conflicts. The fixed audio playback ensures consistent alerts. The stricter input validation (whole numbers ≥1 minute) prevents configuration errors. The example page demonstrates possible implementations
| **HelinCapan** | 06.04.2025   | [#24 Commit Login Form](https://github.com/luciocanepa/SOPRA_group11_client/commit/d23677af939d2c2c829286362006643b143da8a2) | I made the login page with auth form and redirect | This commit enables the user to log in and use the application |
| **HelinCapan** | 06.04.2025   | [#29 Commit Testing User Update](https://github.com/luciocanepa/SOPRA_group11_server/commit/31ef43f65e6e45c6ad6071cc559f0b4ef6e7e141) | Written tests for the profile editing/updating | These tests ensure that the user profile management functionality works correctly |
| **@moritzboet** | 03.04.2025   | [#25 fixed hashing](https://github.com/luciocanepa/SOPRA_group11_server/commit/aae00a892dd7be6bae21614b201d7ced906772a3) | resolved the issues with the hasing of passwords and recoginising the correct password for login by using an encoder and adding the dependency to build.gradle. fixed #25 | the hashing works now |
|                    | 05.04.2025   | [#26 tests for login](https://github.com/luciocanepa/SOPRA_group11_server/commit/88d6aff5a630fa4ed51e80ba1713cd0315e1d7cb) | added all the test for the user login in controller userservice and userserviceintegration, but the test for valid login in the userservice test isn't working, because of some problems with recognizing the correct password because of hashing. in addition I also made a small change to the userservice loginUser fuction so when you login your status always gets set to online and not just changed. #26 | login is testable. |
|                    | 07.04.2025   | [#40 sonarqube issues](https://github.com/luciocanepa/SOPRA_group11_server/commit/0208e58649ba4ec2555661c7594cbdf7ec4dfe02) | our sonarqube is failing because of too much code duplication. i looked into it for a long time and saw that we can't use interfaces to abstract it, but abstract classes are also not optimal because a class can only extend one superclass and they don't all share the same methods and attributes. i made an example version that fixes some duplication for group, groupGetDTO and groupPostDTO. #40 | eliminates duplication |

---

## Contributions Week 3 - 07.04.2025 to 13.04.2025

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser5]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 4 - 14.04.2025 to 20.04.2025

_Continue with the same table format as above._

---

## Contributions Week 5 - 21.04.2025 to 27.04.2025

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
