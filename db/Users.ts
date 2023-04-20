import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./index"

const Users = sequelize.define('users', {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  randomKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  gender: {
    type: DataTypes.STRING,
  },
  birthDate: {
    type: DataTypes.DATE,
  },
  regDate: {
    type: DataTypes.DATE,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // SNS
  github: {
    type: DataTypes.STRING,
  },
  twitter: {
    type: DataTypes.STRING,
  },
  facebook: {
    type: DataTypes.STRING,
  },
  linkedin: {
    type: DataTypes.STRING,
  },
  weibo: {
    type: DataTypes.STRING,
  },
  zhihu: {
    type: DataTypes.STRING,
  },
  douban: {
    type: DataTypes.STRING,
  },
  juejin: {
    type: DataTypes.STRING,
  },

  times: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fansCounts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  followingCounts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastLoginDate: {
    type: DataTypes.DATE,
  },
  lastLoginIP: {
    type: DataTypes.STRING,
  },
  
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  

}, {
  // 这是其他模型参数
})

export default Users