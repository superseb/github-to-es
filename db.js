
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'app'});
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'error'
});

function createIndex() {
  log.info("creating index");

  return client.indices.create({
    index: "github",
    body: {
      "mappings": {
        "issue": {
          "properties": {
            "title":            { "type": "text"  },
            "state":            { "type": "keyword"  },
            "repo":             { "type": "keyword"  },
            "labels":           { "type": "keyword"  },
            "number":           { "type": "keyword"  },
            "comments":         { "type": "long"  },
            "assignee":         { "type": "keyword"  },
            "user_login":       { "type": "keyword"  },
            "closed_by":        { "type": "keyword"  },
            "milestone":        { "type": "keyword"  },
            "created_at":       { "type": "date"  },
            "closed_at":        { "type": "date"  },
            "updated_at":       { "type": "date"  },
            "is_pull_request":      { "type": "boolean"  },
            "minutes_open":         { "type": "long"  },
            "created_iso_week_day": { "type": "integer"  },
          }
        },
        "comment": {
          "properties": {
            "issue":                { "type": "keyword"  },
            "repo":                 { "type": "keyword"  },
            "user_login":           { "type": "keyword"  },
            "created_at":           { "type": "date"     },
            "created_iso_week_day": { "type": "integer"  },
          }
        }
      }
    }
  }).then(res => {
    log.info(res, 'ES index created');
  }).catch(err => {
    log.error(err, "index creation failed");
  });
}

function resetIndex() {
  log.info('deleting old ES index');
  client.indices.delete({index: 'github'})
    .then(res => {
      log.info(res, "index deleted");
      return createIndex();
    }).catch(err => {
      log.error("index deletion failed");
      return createIndex();
    });
}

function handleEsError(err, resp) {
  log.error('ES error', err, resp);
}

function saveIssue(issue) {
  return client.index({
    index: 'github',
    type: 'issue',
    id: issue.id,
    body: issue,
  }).then(res => {
    log.info('Saved issue', {number: issue.number, repo: issue.repo});
  }).catch(handleEsError);
}

function saveComment(comment) {
  return client.index({
    index: 'github',
    type: 'comment',
    id: comment.id,
    body: comment,
  }).then(res => {
    log.info('Saved comment', {created_at: comment.created_at, by: comment.user_login, repo: comment.repo});
  }).catch(handleEsError);
}

module.exports = {
  saveIssue: saveIssue,
  saveComment: saveComment,
  resetIndex: resetIndex,
  createIndex: createIndex,
};
