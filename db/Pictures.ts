import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./index"

const Pictures = sequelize.define('pictures', {
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
  },
  pHash: {
    type: DataTypes.STRING,
  },
  exif: {
    type: DataTypes.JSON,
  },
  icc: {
    type: DataTypes.JSON,
  },
  md5: {
    type: DataTypes.STRING,
  },
  cachePath: {
    type: DataTypes.STRING,
  },
  colors: {
    type: DataTypes.JSON,
  },
  dateTimeOriginal: {
    type: DataTypes.STRING,
  },
  fileType: {
    type: DataTypes.JSON,
  },
  width: {
    type: DataTypes.INTEGER,
  },
  height: {
    type: DataTypes.INTEGER,
  },
  space: {
    type: DataTypes.STRING,
  },
  channels: {
    type: DataTypes.INTEGER,
  },
  depth: {
    type: DataTypes.STRING,
  },
  hasAlpha: {
    type: DataTypes.BOOLEAN,
  },
}, {
  // 这是其他模型参数
})

export default Pictures