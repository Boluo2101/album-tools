import { Sequelize } from 'sequelize'
import CONFIGS from '../configs/index'
import path from 'path'

const sequelize = new Sequelize(
  {
    dialect: 'sqlite',
    storage: path.join(__dirname, CONFIGS.db.fileNameOfVideos),
    logging: CONFIGS.db.log,
  },
)

export default sequelize
