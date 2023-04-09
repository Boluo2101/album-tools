import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./indexVideos"

const Videos = sequelize.define('videos', {
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
  details: {
    type: DataTypes.JSON,
  },
  md5: {
    type: DataTypes.STRING,
  },
  md5CachesPath: {
    type: DataTypes.JSON,
  },
  pHashes: {
    type: DataTypes.JSON,
  },
  cachesPath: {
    type: DataTypes.JSON,
  },
  colors: {
    type: DataTypes.JSON,
  }
}, {
  // 这是其他模型参数
})

export default Videos