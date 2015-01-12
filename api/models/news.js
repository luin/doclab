module.exports = function(DataTypes) {
  return [{
    type: {
      type: DataTypes.ENUM(
        // Project
        'project.create',
        // Collection
        'collection.create',
        'collection.destroy',
        // Doc
        'doc.create',
        'doc.rename',
        'doc.update',
        'doc.destroy'
      ),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    DocUUID: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      }
    }
  }, {
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeCreate: function *(news) {
        news.content = JSON.stringify(news.content);
      }
    }
  }];
};
