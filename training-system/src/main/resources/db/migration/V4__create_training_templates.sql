-- training_plans: top-level training plan
CREATE TABLE IF NOT EXISTS training_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    expected_days INT NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1, -- 0=停用,1=啟用
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE training_plans
    ADD CONSTRAINT fk_training_plans_created_by
        FOREIGN KEY (created_by) REFERENCES users (user_id);

-- training_main_items: plan -> multiple main items
CREATE TABLE IF NOT EXISTS training_main_items (
    id BIGSERIAL PRIMARY KEY,
    training_plan_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    expected_days INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE training_main_items
    ADD CONSTRAINT fk_training_main_items_plan
        FOREIGN KEY (training_plan_id) REFERENCES training_plans (id) ON DELETE CASCADE;

-- training_sub_items: main item -> multiple sub items
CREATE TABLE IF NOT EXISTS training_sub_items (
    id BIGSERIAL PRIMARY KEY,
    main_item_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE training_sub_items
    ADD CONSTRAINT fk_training_sub_items_main
        FOREIGN KEY (main_item_id) REFERENCES training_main_items (id) ON DELETE CASCADE;

-- training_todos: sub item -> tasks
CREATE TABLE IF NOT EXISTS training_todos (
    id BIGSERIAL PRIMARY KEY,
    sub_item_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    day_index INT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE training_todos
    ADD CONSTRAINT fk_training_todos_sub_item
        FOREIGN KEY (sub_item_id) REFERENCES training_sub_items (id) ON DELETE CASCADE;
