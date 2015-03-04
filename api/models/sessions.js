module.exports = function(DataTypes) {
  return [{
    token: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4
      }
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 3600 * 24 * 14
      }
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userAgent: {
      type: DataTypes.STRING
    },
    expiredAt: DataTypes.DATE
  }, {
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeCreate: function (session) {
        var now = new Date();
        session.createdAt = now;
        session.expiredAt = new Date(now.valueOf() + session.ttl * 1000);
      }
    },
    classMethods: {
      getUser: function *(token) {
        var session;
        try {
          session = yield this.find({ where: { token: token } });
        } catch (err) {
        }
        if (!session) {
          return null;
        }
        var now = new Date();
        if (session.expiredAt < now) {
          return null;
        }
        if (Math.random() < 0.01) {
          yield Session.destroy({ where: { expiredAt: { lt: now } } });
        }
        var user = yield session.getUser();
        if (!user) {
          return null;
        }
        user.setDataValue('currentSession', session);
        return user;
      }
    }
  }];
};
