var mysql = require('mysql');

function DB(config) {
    this.pool = mysql.createPool({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.db
    });
}

var escape = {
    exp : /["'\\]/g,
    map: {
        '"': '\\\"',
        "'": "\\'",
        '\\': ('\\\\')
    }
};

String.prototype.escape = function() {
    return String(this).replace(escape.exp, function (s) {
        return escape.map[s];
    });
};

DB.prototype.getConnection = function(callback) {
    this.pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
};

DB.prototype.addUser = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        connection.query("INSERT INTO `pm_users` (`name`, `mail`, `password`) " +
            "VALUES ('" + data.userName.escape() + "', '" + data.mail + "', '" + data.password + "');",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({id: rows.insertId});
                connection.release();
                return;
            });

    });
};

DB.prototype.getUser = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        var query = (data.mail != undefined) ?
        "SELECT * FROM pm_users WHERE mail = '" + data.mail + "';"
            :
        "SELECT * FROM pm_users" + (data.id > 0 ? ("WHERE id = " + data.id) : "") + ";";

        connection.query(query,
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({rows: rows});
                connection.release();
                return;
            });

    });
};

DB.prototype.getProject = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({ "place": "1", "id": "-1", "code": err});
            return;
        }

        var queryForAll =
            "SELECT * FROM " +
                "(SELECT * FROM " +
                    "(SELECT * FROM pm_projects WHERE " +
                        "(id in (SELECT projectId FROM pm_project_participants WHERE userId = " + data.userId + ") " +
                        "OR creatorId = " + data.userId + ")) as t1 " +
                "LEFT JOIN " +
                    "(SELECT id as uid, name FROM pm_users) as t2 " +
                "ON t1.creatorId = t2.uid) as t5 " +
            "LEFT JOIN " +
                "(SELECT GROUP_CONCAT(t1.name SEPARATOR ', ') as participants, projectId FROM " +
                    "(SELECT name, projectId FROM " +
                        "(SELECT * FROM pm_project_participants) as t3 " +
                    "LEFT JOIN " +
                        "(SELECT id as uid, name FROM pm_users) as t4 " +
                    "ON t3.userId = t4.uid) as t1 " +
                "GROUP BY projectId) as t6 " +
            "ON t5.id = t6.projectId ORDER by t5.id DESC;";

        var queryForOne = "SELECT * FROM pm_projects WHERE " +
            "(id in (SELECT projectId FROM pm_project_participants WHERE userId = " + data.userId + ") OR creatorId = " + data.userId + ") " +
            "AND " +
            "id = " + data.id + ";";

        connection.query((data.id > 0 ? queryForOne : queryForAll),
            function (err, rows) {
                if (err) {
                    callback({ "place": "2", "id": "-1", "code": err});
                    connection.release();
                    return;
                }

                callback({rows: rows});
                connection.release();
                return;
            });

    });
};

DB.prototype.deleteProject = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        connection.query("DELETE FROM pm_tasks WHERE projectId = " + data.id + ";",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                connection.query("DELETE FROM pm_projects WHERE id = " + data.id + ";",
                    function (err, rows) {
                        if (err) {
                            callback({"id": "-1", "code": err.code});
                            connection.release();
                            return;
                        }

                        callback({rows: rows});
                        connection.release();
                        return;
                    });
            });

    });
};

DB.prototype.updateProject = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        connection.query("UPDATE pm_projects SET `title`='" + data.title.escape() + "', `description`='" + data.description.escape() + "' " +
            "WHERE `id`='" + data.id + "';",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({rows: rows});
                connection.release();
                return;
            });

    });
};

DB.prototype.addProject = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }
        connection.query("INSERT INTO `pm_projects` (`title`, `description`, `creatorId`, `creationDate`, `updateDate` ) " +
            "VALUES ('" + data.title.escape() + "', '" + data.description.escape() + "', '" + data.creatorId + "', NOW(), NOW());",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({"id": rows.insertId});
                connection.release();
                return;
            });

    });
};

DB.prototype.addTask = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        connection.query("INSERT INTO pm_tasks (`title`, `description`, `priority`, `plannedCapacity`, `actualCapacity`, `assigneeId`, `creatorId`, `projectId`, `status`) " +
            "VALUES ('" + data.title.escape() + "', '" + data.description.escape() + "', '" + data.priority + "', '" + data.plannedCapacity + "', " +
            "'" + data.actualCapacity + "', '" + data.assigneeId + "', '" + data.creatorId + "', '" + data.projectId + "', '" + data.status + "');",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({"id": rows.insertId});
                connection.release();
                return;
            });

    });
};

DB.prototype.getTask = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        connection.query("SELECT * FROM " +
            "(SELECT * FROM pm_tasks WHERE " + (data.id > 0 ? "id = " + data.id : "projectId = " + data.projectId) + " ) as t1 " +
            "LEFT JOIN " +
            "(SELECT id as uid, name FROM pm_users) as t2 " +
            "ON t1.assigneeId = t2.uid;",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({"rows": rows});
                connection.release();
                return;
            });

    });
};

DB.prototype.updateTask = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        var properties = [];
        if (data.title != undefined) {
            properties.push(("`title`='" + data.title.escape() + "'"));
        }
        if (data.description != undefined) {
            properties.push(("`description`='" + data.description.escape() + "'"));
        }
        if (data.priority != undefined) {
            properties.push(("`priority`='" + data.priority + "'"));
        }
        if (data.plannedCapacity != undefined) {
            properties.push(("`plannedCapacity`='" + data.plannedCapacity + "'"));
        }
        if (data.actualCapacity != undefined) {
            properties.push(("`actualCapacity`='" + data.actualCapacity + "'"));
        }
        if (data.assigneeId != undefined) {
            properties.push(("`assigneeId`='" + data.assigneeId + "'"));
        }
        if (data.status != undefined) {
            properties.push(("`status`='" + data.status + "'"));
        }

        connection.query("UPDATE pm_tasks SET " + properties.join(", ") + " WHERE `id`='" + data.id + "';",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({rows: rows});
                connection.release();
                return;
            });

    });
};

DB.prototype.deleteTask = function(data, callback) {
    this.getConnection(function (err, connection) {
        if (err) {
            callback({"id": "-1", "code": err.code});
            return;
        }

        connection.query("DELETE FROM pm_tasks WHERE id = " + data.id + ";",
            function (err, rows) {
                if (err) {
                    callback({"id": "-1", "code": err.code});
                    connection.release();
                    return;
                }

                callback({rows: rows});
                connection.release();
                return;
            });

    });
};

module.exports = DB;