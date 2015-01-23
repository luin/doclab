exports.load = function *() {
  return [
    yield Team.create({
      name: 'Team1'
    }),
    yield Team.create({
      name: 'Team2'
    }),
    yield Team.create({
      name: 'Team3'
    }),
    yield Team.create({
      name: 'Team4'
    }),
    yield Team.create({
      name: 'Team5'
    }),
    yield Team.create({
      name: 'Team6'
    })
  ];
};
