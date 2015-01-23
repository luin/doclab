exports.load = function *() {
  return [
    yield Collection.create({
      name: 'collection0',
      description: 'Collection0'
    }),
    yield Collection.create({
      name: 'collection1',
      description: 'Collection1'
    }),
    yield Collection.create({
      name: 'collection2',
      description: 'Collection2'
    }),
    yield Collection.create({
      name: 'collection3',
      description: 'Collection3'
    })
  ];
};
