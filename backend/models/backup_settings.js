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
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    autoBackup: {
      field: 'auto_backup',
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    backupFrequency: {
      field: 'backup_frequency',
      type: DataTypes.TEXT,
      defaultValue: 'daily',
    },
    backupTime: {
      field: 'backup_time',
      type: DataTypes.TIME,
      defaultValue: '00:00:00',
    },
    retentionDays: {
      field: 'retention_days',
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    storageProvider: {
      field: 'storage_provider',
      type: DataTypes.TEXT,
      defaultValue: 'local',
    },
    storagePath: {
      field: 'storage_path',
      type: DataTypes.TEXT,
    },
    cloudCredentials: {
      field: 'cloud_credentials',
      type: DataTypes.JSONB,
    },
    lastBackup: {
      field: 'last_backup',
      type: DataTypes.DATE,
    },
    backupHistory: {
      field: 'backup_history',
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      field: 'updated_at',
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