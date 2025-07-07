const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class BackupSettings extends Model {}
  BackupSettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    auto_backup: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    backup_frequency: {
      type: DataTypes.TEXT,
      defaultValue: 'daily',
    },
    backup_time: {
      type: DataTypes.TIME,
      defaultValue: '00:00:00',
    },
    retention_days: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    storage_provider: {
      type: DataTypes.TEXT,
      defaultValue: 'local',
    },
    storage_path: {
      type: DataTypes.TEXT,
    },
    cloud_credentials: {
      type: DataTypes.JSONB,
    },
    last_backup: {
      type: DataTypes.DATE,
    },
    backup_history: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'BackupSettings',
    tableName: 'backup_settings',
    timestamps: false,
    underscored: true,
  });
  return BackupSettings;
}; 