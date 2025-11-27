INSERT INTO role_mst (role_id, code, name_ja, description, sort_order) VALUES
    (1, 'SYSTEM_ADMIN', 'システム管理者', 'システム全体を管理するロール', 1),
    (2, 'ADMIN', '管理者', '企業管理者', 2),
    (3, 'TRAINER', '教育担当者', '研修を管理・実施する担当者', 3),
    (4, 'TRAINEE', '研修者', '研修を受講する利用者', 4)
ON CONFLICT (role_id) DO NOTHING;

INSERT INTO role_mst (role_id, code, name_ja, description, sort_order) VALUES
    (5, 'GUEST', 'ゲスト', '暫定ゲスト権限', 5)
ON CONFLICT (role_id) DO NOTHING;
