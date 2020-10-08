const request = require("supertest");
const server = require("../app");
const { User } = require("../models");
const bcrypt = require("bcrypt");

const mockUser = require("./mocks/users");

//login logout and register tests

describe("Register & Login Tests", () => {
  beforeAll(async () => {
    await User.destroy({ truncate: true, force: true }); 
    mockUser.user.password = await bcrypt.hash(mockUser.user.password, 10);
    mockUser.user.securityAnswer= await bcrypt.hash(mockUser.user.securityAnswer, 10);
    await User.create(mockUser.user);
   
  })
  afterAll(async () => {
    await server.close();
  });

  // user register
  test("User Can Reset Password", async (done) => {

    const questionResponse = await request(server)
      .post("/api/v1/auth/getquestion")
      .send({userName: mockUser.resetPassword.userName});
    expect(questionResponse.status).toBe(200);
    expect(questionResponse.body.securityQuestion).toBe(mockUser.user.securityQuestion);

    const answerRequest = {
      securityAnswer : mockUser.resetPassword.securityAnswer,
      userName : mockUser.resetPassword.userName
    }

    const answerResponse = await request(server)
      .post("/api/v1/auth/validateanswer")
      .send(answerRequest);
    expect(answerResponse.status).toBe(200);
    expect(answerResponse.body.resetToken.length > 0);

    const newPasswordRequest = {
      resetToken: answerResponse.body.resetToken,
      password: "654321"
    }

    const newPasswordResponse = await request(server)
      .patch("/api/v1/auth/passwordupdate")
      .send(newPasswordRequest);
    expect(newPasswordResponse.status).toBe(200);

    const loginAfterChangedPasswordRequest = {
      userName: mockUser.login.userName, 
      password:"654321",
      rememberMe: "true"
    }

    const loginAfterChangedPasswordRes = await request(server)
      .post("/api/v1/auth/login")
      .send(loginAfterChangedPasswordRequest);
    expect(loginAfterChangedPasswordRes.status).toBe(200);

    const oldPasswordLoginResponse = await request(server)
      .post("/api/v1/auth/login")
      .send(mockUser.login);
    expect(oldPasswordLoginResponse.status).toBe(403);

    done();
  });
  
});