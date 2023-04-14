const { Thought, User } = require('../models');

const thoughtController = {
  // GET all thoughts
  getAllThoughts(req, res) {
    Thought.find({})
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // GET a single thought by id
  getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.thoughtId })
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .then(dbThoughtData => {
        // If no thought is found, send 404
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // CREATE a new thought and add to user's thoughts array
  addThought({body}, res) {
    Thought.create(body)
      .then(({ _id }) => {
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { thoughts: _id } },
          { new: true }
        );
      })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with that id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => res.json(err));
  },

  // UPDATE a thought by id
  updateThought({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.thoughtId }, body, { new: true, runValidators: true })
      .then(dbThoughtData => {
        // If no thought is found, send 404
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No thought found with given id!' });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(400).json(err));
  },

  // DELETE a thought by id
  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.thoughtId })
      .then(dbThoughtData => {
        // If no thought is found, send 404
        if (!dbThoughtData) {
          if (!res.headersSent) {
            res.status(404).json({ message: 'No thought found with this id!' });
          }
          return;
        }
        // Remove the thought id from the associated user's thoughts array
        return User.findOneAndUpdate(
          { thoughts: params.id },
          { $pull: { thoughts: params.id } },
          { new: true }
        );
      })
      .then(() => {
        if (!res.headersSent) {
          res.json({ message: 'Thought removed!' });
        }
      })
      .catch(err => {
        if (!res.headersSent) {
          res.status(400).json(err);
        }
      });
  },
  
  

  // CREATE a new reaction for a thought
  addReaction(req, res) {
    const { reactionBody } = req.body;
    const { thoughtId } = req.params;
    const { username } = req.body;

    Thought.findOneAndUpdate(
      { _id: thoughtId },
      { $addToSet: { reactions: { reactionBody, username } } },
      { new: true }
    )
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No thought with given id!' });
          return;
        }

        res.json(dbThoughtData);
      })
      .catch((err) => res.json(err));
  },

  // remove reaction from thought
  deleteReactions(req, res) {
  const { thoughtId, reactionId } = req.params;

  Thought.findOneAndUpdate(
    { _id: thoughtId },
    { $pull: { reactions: { _id: reactionId } } },
    { new: true }
  )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        return res.status(404).json({ message: 'No reaction with that id!' });
      }

      res.json({ message: 'Reaction successfully deleted!' });
    })
    .catch((err) => res.status(400).json(err));
}

  
  
};

module.exports = thoughtController;
