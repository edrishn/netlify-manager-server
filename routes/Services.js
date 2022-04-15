var { rest } = require("msw");

// if (typeof localStorage === "undefined" || localStorage === null) {
//   localStorage = require("localstorage-memory");
// }

let handlers = [
  rest.post("/AddUserRole", function (req, res, ctx) {
    let userId = parseInt(req.url.searchParams.get("id"));
    let role = req.url.searchParams.get("role");

    let database = localStorage.getItem("Database");
    database = JSON.parse(database);
    let targetUser = database.User.find((user) => user.ID === userId);
    let duplicateRole = targetUser.Roles.includes(role);
    if (duplicateRole)
      return res(ctx.status(400), ctx.body("This user already has this role"));

    targetUser.Roles.push(role);

    let targetUserIndex = database.User.findIndex((user) => user.ID === userId);

    database.User.splice(targetUserIndex, 1);
    database.User.push(targetUser);
    localStorage.setItem("Database", JSON.stringify(database));

    return res(ctx.status(204));
  }),

  rest.post("/AddUserStaff", function (req, res, ctx) {
    let staffId = parseInt(req.url.searchParams.get("staffId"));
    let userId = parseInt(req.url.searchParams.get("id"));
    let database = localStorage.getItem("Database");
    database = JSON.parse(database);

    let staffObj = database.Staff.find((staff) => staff.ID === staffId);
    let targetUser = database.User.find((user) => user.ID === userId);
    let duplicateUserStaff = targetUser.Staffs.find(
      (item) => item === staffObj.Name
    );
    if (duplicateUserStaff)
      return res(ctx.status(400), ctx.body("This user already has this staff"));

    targetUser.Staffs.push(staffObj.Name);

    let targetUserIndex = database.User.findIndex((item) => item.ID === userId);
    database.User.splice(targetUserIndex, 1);
    database.User.push(targetUser);
    localStorage.setItem("Database", JSON.stringify(database));

    return res(ctx.status(204));
  }),

  rest.post("/AddUser", function (req, res, ctx) {
    let userName = req.body.Name;
    let mobile = req.body.Mobile;

    let database = localStorage.getItem("Database");
    database = JSON.parse(database);

    let duplicateUser = database.User.find((item) => item.Name === userName);
    if (duplicateUser)
      return res(ctx.status(400), ctx.body("This user already exists"));

    let idArray = [];

    database.User.forEach((user) => idArray.push(user.ID));
    idArray.sort((a, b) => {
      return a - b;
    });

    let lastId = idArray.slice(-1)[0];
    let newId = lastId + 1;

    let newUser = {
      ID: newId,
      Name: userName,
      Roles: [],
      Staffs: [],
      DeniedRoles: [],
      Mobile: mobile
    };
    database.User.push(newUser);
    localStorage.setItem("Database", JSON.stringify(database));

    if (mobile.startsWith("093")) {
      return res(
        ctx.status(200),
        ctx.json({
          ID: newId,
          LoginLink: "https://google.com",
          Message: ""
        })
      );
    } else if (newUser.Mobile.startsWith("091")) {
      return res(
        ctx.status(200),
        ctx.json({
          ID: newId,
          LoginLink: "",
          Message: "Invited Successfully"
        })
      );
    }
  }),

  rest.get("/GetRoles", function (req, res, ctx) {
    let database = localStorage.getItem("Database");
    database = JSON.parse(database);
    let roles = database.Role;

    return res(ctx.status(200), ctx.json(roles));
  }),

  rest.get("/GetStaffs", function (req, res, ctx) {
    let database = localStorage.getItem("Database");
    database = JSON.parse(database);
    let staffs = database.Staff;

    return res(ctx.status(200), ctx.json(staffs));
  }),

  rest.get("/GetUsers", function (req, res, ctx) {
    console.log("here in Get");
    let database = localStorage.getItem("Database");
    database = JSON.parse(database);
    let users = database.User;
    console.log("users are: ", users);

    return res(ctx.status(200), ctx.json(users));
  }),

  rest.put("/RemoveUserRole", function (req, res, ctx) {
    let userId = parseInt(req.url.searchParams.get("id"));
    let role = req.url.searchParams.get("role");

    let database = localStorage.getItem("Database");
    database = JSON.parse(database);

    let targetUser = database.User.find((user) => user.ID === userId);
    let targetUserIndex = database.User.findIndex((user) => user.ID === userId);
    let roleIndex = targetUser.Roles.findIndex((item) => item.Name === role);

    let roleExist = targetUser.Roles.includes(role);

    if (!roleExist)
      return res(ctx.status(400), ctx.body("User has not this role"));

    targetUser.Roles.splice(roleIndex, 1);
    database.User.splice(targetUserIndex, 1);
    database.User.push(targetUser);
    localStorage.setItem("Database", JSON.stringify(database));

    return res(ctx.status(204));
  }),

  rest.put("/RemoveUserStaff", function (req, res, ctx) {
    let userId = parseInt(req.url.searchParams.get("id"));
    let staffId = parseInt(req.url.searchParams.get("staffId"));

    let database = localStorage.getItem("Database");
    database = JSON.parse(database);

    let targetUser = database.User.find((user) => user.ID === userId);
    let userIndex = database.User.findIndex((user) => user.ID === userId);
    let staffObj = database.Staff.find((item) => item.ID === staffId);
    let staffIndex = targetUser.Staffs.findIndex(
      (item) => item === staffObj.Name
    );

    let staffExist = targetUser.Staffs.find((item) => item === staffObj.Name);
    if (!staffExist)
      return res(ctx.status(400), ctx.body("User has not this staff"));
    targetUser.Staffs.splice(staffIndex, 1);
    database.User.splice(userIndex, 1);
    database.User.push(targetUser);
    localStorage.setItem("Database", JSON.stringify(database));

    return res(ctx.status(204));
  }),

  rest.put("/DenyStaffRole", function (req, res, ctx) {
    let userId = parseInt(req.url.searchParams.get("id"));
    let role = req.url.searchParams.get("role");
    let staffId = parseInt(req.url.searchParams.get("staffId"));
    let database = localStorage.getItem("Database");
    database = JSON.parse(database);

    let staffObj = database.Staff.find((item) => item.ID === staffId);

    let targetUser = database.User.find((user) => user.ID === userId);
    let targetUserIndex = database.User.findIndex((user) => user.ID === userId);
    let hasRole = staffObj.Roles.includes(role);

    let staffRoleExist = targetUser.DeniedRoles.includes(role);
    if (!hasRole)
      return res(
        ctx.status(400),
        ctx.body("This role does not Exist in this Staff!")
      );
    else if (staffRoleExist)
      return res(ctx.status(400), ctx.body("This role is already Denied!"));

    targetUser.DeniedRoles.push(role);
    database.User.splice(targetUserIndex, 1);
    database.User.push(targetUser);
    localStorage.setItem("Database", JSON.stringify(database));

    return res(ctx.status(204));
  }),

  rest.post("/AllowStaffRole", function (req, res, ctx) {
    let userId = parseInt(req.url.searchParams.get("id"));
    let role = req.url.searchParams.get("role");
    let staffId = parseInt(req.url.searchParams.get("staffId"));
    let database = localStorage.getItem("Database");
    database = JSON.parse(database);

    let staffObj = database.Staff.find((item) => item.ID === staffId);

    let targetUser = database.User.find((user) => user.ID === userId);
    let targetUserIndex = database.User.findIndex((user) => user.ID === userId);

    let roleIndexInDeniedRoles = targetUser.DeniedRoles.findIndex(
      (item) => item === role
    );

    let hasRole = staffObj.Roles.includes(role);
    if (!hasRole)
      return res(
        ctx.status(400),
        ctx.body("This role does not Exist in this Staff!")
      );
    else if (roleIndexInDeniedRoles === -1)
      return res(ctx.status(400), ctx.body("Staff already has this role"));

    targetUser.DeniedRoles.splice(roleIndexInDeniedRoles, 1);

    database.User.splice(targetUserIndex, 1);
    database.User.push(targetUser);
    localStorage.setItem("Database", JSON.stringify(database));

    return res(ctx.status(204));
  }),

  rest.post("/Reset", function (req, res, ctx) {
    console.log("here in Reset");
    console.log("req: ", req.body);
    localStorage.removeItem("Database");
    let databaseExist = localStorage.getItem("Database");
    if (!databaseExist) {
      localStorage.setItem("Database", JSON.stringify(req.body));
    }
    return res(ctx.body("Reset"));
  })
];

module.exports = handlers;
