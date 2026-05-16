/**
 * Migration: Converter roles (array) para role (único)
 *
 * Este script converte o modelo de usuários de múltiplas roles
 * para uma única role por usuário.
 *
 * ATENÇÃO: Execute este script apenas UMA VEZ após fazer backup do banco!
 */

// 1. Mostrar estatísticas antes da migration
print('\n========================================');
print('ANTES DA MIGRATION');
print('========================================\n');

const totalUsers = db.users.countDocuments();
const usersWithRoles = db.users.countDocuments({ roles: { $exists: true } });
const usersWithEmptyRoles = db.users.countDocuments({ roles: { $size: 0 } });
const usersWithMultipleRoles = db.users.countDocuments({
  'roles.1': { $exists: true }
});

print(`Total de usuários: ${totalUsers}`);
print(`Usuários com campo 'roles': ${usersWithRoles}`);
print(`Usuários com roles vazias: ${usersWithEmptyRoles}`);
print(`Usuários com múltiplas roles: ${usersWithMultipleRoles}`);

// 2. Buscar role padrão "Usuario"
const roleUsuario = db.roles.findOne({ name: 'Usuario' });

if (!roleUsuario) {
  print('\n⚠️  ERRO: Role "Usuario" não encontrada!');
  print('Crie a role padrão primeiro antes de executar a migration.');
  throw new Error('Role Usuario não encontrada');
}

print(`\nRole padrão "Usuario" encontrada: ${roleUsuario._id}`);

// 3. BACKUP: Salvar estado atual em collection temporária
print('\n========================================');
print('CRIANDO BACKUP');
print('========================================\n');

db.users.aggregate([
  { $match: {} },
  { $out: 'users_backup_before_role_migration' }
]);

const backupCount = db.users_backup_before_role_migration.countDocuments();
print(`✅ Backup criado: ${backupCount} usuários salvos em 'users_backup_before_role_migration'`);

// 4. Migration: Converter roles para role
print('\n========================================');
print('EXECUTANDO MIGRATION');
print('========================================\n');

// 4.1. Usuários com roles não vazias - pega a primeira role
const result1 = db.users.updateMany(
  {
    roles: { $exists: true, $ne: [] }
  },
  [
    {
      $set: {
        role: { $arrayElemAt: ['$roles', 0] }
      }
    },
    {
      $unset: 'roles'
    }
  ]
);

print(`✅ Convertidos ${result1.modifiedCount} usuários com roles existentes`);

// 4.2. Usuários com roles vazias ou sem campo roles - atribui role padrão
const result2 = db.users.updateMany(
  {
    $or: [
      { roles: { $exists: true, $eq: [] } },
      { roles: { $exists: false } },
      { role: { $exists: false } }
    ]
  },
  [
    {
      $set: {
        role: roleUsuario._id
      }
    },
    {
      $unset: 'roles'
    }
  ]
);

print(`✅ Atribuída role padrão para ${result2.modifiedCount} usuários`);

// 5. Verificação pós-migration
print('\n========================================');
print('APÓS A MIGRATION');
print('========================================\n');

const totalAfter = db.users.countDocuments();
const usersWithRole = db.users.countDocuments({ role: { $exists: true } });
const usersWithOldRoles = db.users.countDocuments({ roles: { $exists: true } });
const usersWithoutRole = db.users.countDocuments({
  $or: [
    { role: { $exists: false } },
    { role: null }
  ]
});

print(`Total de usuários: ${totalAfter}`);
print(`Usuários com campo 'role': ${usersWithRole}`);
print(`Usuários ainda com campo 'roles': ${usersWithOldRoles}`);
print(`Usuários sem role: ${usersWithoutRole}`);

// 6. Amostras de usuários migrados
print('\n========================================');
print('AMOSTRA DE USUÁRIOS MIGRADOS');
print('========================================\n');

db.users.find({}, { email: 1, role: 1, roles: 1 })
  .limit(5)
  .forEach(user => {
    print(`Email: ${user.email}`);
    print(`  Role: ${user.role}`);
    print(`  Roles (deve estar ausente): ${user.roles}`);
    print('');
  });

// 7. Validações finais
print('========================================');
print('VALIDAÇÕES FINAIS');
print('========================================\n');

let hasErrors = false;

if (usersWithOldRoles > 0) {
  print(`❌ ERRO: ${usersWithOldRoles} usuários ainda possuem campo 'roles'`);
  hasErrors = true;
}

if (usersWithoutRole > 0) {
  print(`❌ ERRO: ${usersWithoutRole} usuários estão sem role`);
  hasErrors = true;
}

if (usersWithRole !== totalAfter) {
  print(`❌ ERRO: Nem todos os usuários possuem role (${usersWithRole}/${totalAfter})`);
  hasErrors = true;
}

if (!hasErrors) {
  print('✅ Migration concluída com sucesso!');
  print('\nPróximos passos:');
  print('1. Teste o sistema com as mudanças');
  print('2. Se tudo estiver OK, você pode remover o backup:');
  print('   db.users_backup_before_role_migration.drop()');
} else {
  print('\n⚠️  Erros detectados! Considere restaurar do backup:');
  print('   db.users.drop()');
  print('   db.users_backup_before_role_migration.aggregate([');
  print('     { $match: {} },');
  print('     { $out: "users" }');
  print('   ])');
}

print('\n========================================\n');
