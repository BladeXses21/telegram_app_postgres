CREATE TABLE users (
    uid SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    profile_photo_url VARCHAR(255) DEFAULT 'https://via.placeholder.com/150' NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE currency (
    uid SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    total_capacity BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency_capacity BIGINT
);

CREATE TABLE balance (
    user_uid INT NOT NULL,
    currency_uid INT NOT NULL,
    quantity DECIMAL(20, 10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_uid, currency_uid),
    FOREIGN KEY (user_uid) REFERENCES users(uid),
    FOREIGN KEY (currency_uid) REFERENCES currency(uid)
);

CREATE TABLE exchange_rate (
    source_currency_uid INT NOT NULL,
    target_currency_uid INT NOT NULL,
    rate DECIMAL(20, 10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (source_currency_uid, target_currency_uid),
    FOREIGN KEY (source_currency_uid) REFERENCES currency(uid),
    FOREIGN KEY (target_currency_uid) REFERENCES currency(uid)
);
