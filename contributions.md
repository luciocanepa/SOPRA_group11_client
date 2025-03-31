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

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
