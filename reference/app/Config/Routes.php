<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// ===== PUBLIC WEBSITE =====
$routes->get('/', 'Home::index');
$routes->get('/faq', 'PublicSite::faq');

// ── Profile (logged-in user) ──────────────────────────────────────────────
$routes->get('/profile',         'PublicSite::profile');
$routes->get('/profile/edit',    'PublicSite::profileEdit');
$routes->post('/profile/update', 'PublicSite::profileUpdate');

// ── Public self-registration (hidden from nav; accessible by direct link or admin share)
// Requires login OR valid ?key= token set in .env as register.access_key
$routes->get('/register',                              'PublicSite::register');
$routes->get('/register/(:segment)',                   'PublicSite::registerTournament/$1');
$routes->post('/register/(:segment)/submit',           'PublicSite::registerSubmit/$1');
$routes->post('/register/(:segment)/create-player',    'PublicSite::registerCreatePlayer/$1');

$routes->get('/tournaments', 'PublicSite::tournaments');
// TIG download — must come before the generic (:segment) catch-all
$routes->get('/tournaments/(:segment)/tig/download/(:alpha)', 'PublicSite::tigDownload/$1/$2');
// Specific sub-routes BEFORE the generic (:segment) catch-all
$routes->get('/tournaments/(:segment)/bracket', 'PublicSite::bracket/$1');
$routes->get('/tournaments/(:segment)/registrations', 'PublicSite::tournamentRegistrations/$1');
$routes->get('/tournaments/(:segment)/entries', 'PublicSite::tournamentEntries/$1');
$routes->get('/tournaments/(:segment)', 'PublicSite::tournament/$1');
$routes->get('/brackets', 'PublicSite::brackets');
$routes->get('/live', 'PublicSite::live');
$routes->get('/schedule', 'PublicSite::schedule');
$routes->get('/players', 'PublicSite::players');
$routes->get('/players/(:num)', 'PublicSite::player/$1');
$routes->get('/disciplines/(:num)', 'PublicSite::discipline/$1');

// ===== TV LIVE SCORE =====
$routes->get('/tv', 'TV::index');
$routes->get('/tv/live', 'TV::liveMatches');
$routes->get('/tv/schedule', 'TV::schedule');
$routes->get('/tv/combined', 'TV::combined');
$routes->get('/tv/(:num)', 'TV::match/$1');
$routes->get('/tv/table/(:num)', 'TV::table/$1');
// TV interactive scoring (AJAX endpoints, no auth required for TV broadcast)
$routes->post('/tv/match/(:num)/start', 'TV::startMatch/$1');
$routes->post('/tv/match/(:num)/score', 'TV::addScore/$1');
$routes->post('/tv/match/(:num)/end-leg', 'TV::endLeg/$1');
$routes->post('/tv/match/(:num)/remove-frame', 'TV::removeFrame/$1');
$routes->post('/tv/match/(:num)/finish', 'TV::finishMatch/$1');
$routes->post('/tv/match/(:num)/timeout', 'TV::callTimeout/$1');
$routes->post('/tv/match/(:num)/end-timeout', 'TV::endTimeout/$1');
$routes->post('/tv/match/(:num)/next-inning', 'TV::nextInning/$1');
$routes->post('/tv/match/(:num)/prev-inning', 'TV::prevInning/$1');
// ===== AUTH =====
$routes->get('/auth/login', 'AuthController::login');
$routes->post('/auth/login', 'AuthController::loginAttempt');
$routes->get('/auth/logout', 'AuthController::logout');
// Forgot / reset password
$routes->get('/auth/forgot-password',           'AuthController::forgotPassword');
$routes->post('/auth/forgot-password',          'AuthController::forgotPasswordProcess');
$routes->get('/auth/reset-password/(:segment)', 'AuthController::resetPassword/$1');
$routes->post('/auth/reset-password',           'AuthController::resetPasswordProcess');
// Change password (from profile edit page, requires login)
$routes->post('/auth/change-password',          'AuthController::changePassword');

// ===== API for live scoring =====
$routes->group('api', function($routes){
    $routes->get('live/matches', 'Api::liveMatches');
    $routes->get('live/match/(:num)', 'Api::match/$1');
    $routes->get('live/tables', 'Api::liveTables');
    $routes->get('match/(:num)/score', 'Api::matchScore/$1');
    $routes->get('match/(:num)/details', 'Api::matchDetails/$1');

    // ===== External Score Exchange API (Phase M) =====
    // Pull scores out (GET) — requires X-API-Key header or ?api_key= param
    $routes->get('ext/scores', 'Api::extGetScores');
    $routes->get('ext/scores/(:num)', 'Api::extGetScore/$1');
    $routes->get('ext/matches', 'Api::extGetMatches');
    $routes->get('ext/match/(:num)', 'Api::extGetMatch/$1');
    $routes->get('ext/tournaments', 'Api::extGetTournaments');

    // Push scores in (POST) — requires X-API-Key header
    $routes->post('ext/score/(:num)', 'Api::extPushScore/$1');
    $routes->post('ext/match/(:num)/result', 'Api::extPushResult/$1');
    $routes->post('ext/match/(:num)/start', 'Api::extStartMatch/$1');

    // Extended endpoints (Phase M+)
    $routes->get('ext/players', 'Api::extGetPlayers');
    $routes->get('ext/players/(:num)', 'Api::extGetPlayer/$1');
    $routes->get('ext/schedule', 'Api::extGetSchedule');
    $routes->get('ext/live', 'Api::extGetLive');
    $routes->post('ext/score/(:num)/event', 'Api::extPushScoreEvent/$1');

    // API documentation page (no auth needed)
    $routes->get('ext/docs', 'Api::extDocs');
});

// ===== ADMIN (superadmin, admin) =====
$routes->group('admin', ['filter' => 'auth:superadmin,admin'], function($routes){
    $routes->get('/', 'Admin::index');
    $routes->get('dashboard', 'Admin::index');

    // Tournaments
    $routes->get('tournaments', 'AdminTournaments::index');
    $routes->get('tournaments/new', 'AdminTournaments::new');
    $routes->post('tournaments/create', 'AdminTournaments::create');
    $routes->get('tournaments/(:num)', 'AdminTournaments::show/$1');
    $routes->get('tournaments/(:num)/edit', 'AdminTournaments::edit/$1');
    $routes->post('tournaments/(:num)/update', 'AdminTournaments::update/$1');
    $routes->post('tournaments/(:num)/delete', 'AdminTournaments::delete/$1');
    $routes->post('tournaments/batch-delete',  'AdminTournaments::batchDelete');
    $routes->get('tournaments/(:num)/bracket', 'AdminTournaments::bracket/$1');

    // Tournament registrations (multi-division player assignment)
    $routes->get('tournaments/(:num)/registrations',               'AdminRegistration::index/$1');
    $routes->post('tournaments/(:num)/registrations/add-division', 'AdminRegistration::addDivision/$1');
    $routes->post('tournaments/(:num)/registrations/(:num)/update-division', 'AdminRegistration::updateDivision/$1/$2');
    $routes->post('tournaments/(:num)/registrations/remove-division/(:num)', 'AdminRegistration::removeDivision/$1/$2');
    $routes->get('tournaments/(:num)/registrations/search',        'AdminRegistration::searchPlayers/$1');
    $routes->post('tournaments/(:num)/registrations/register',     'AdminRegistration::register/$1');
    $routes->post('tournaments/(:num)/registrations/unregister',   'AdminRegistration::unregister/$1');
    $routes->get('tournaments/(:num)/registrations/batch',         'AdminRegistration::batchPage/$1');
    $routes->post('tournaments/(:num)/registrations/batch',        'AdminRegistration::batchImport/$1');
    $routes->get('tournaments/(:num)/registrations/template',      'AdminRegistration::downloadTemplate/$1');
    $routes->post('tournaments/(:num)/registrations/(:num)/update','AdminRegistration::updateEntry/$1/$2');
    $routes->post('tournaments/(:num)/registrations/(:num)/delete','AdminRegistration::deleteEntry/$1/$2');

    // Tournament entries & draw
    $routes->get('tournaments/(:num)/entries', 'AdminDraw::entries/$1');
    $routes->post('tournaments/(:num)/entries/add', 'AdminDraw::addEntry/$1');
    $routes->post('tournaments/(:num)/entries/(:num)/remove', 'AdminDraw::removeEntry/$1/$2');
    $routes->post('tournaments/(:num)/seed', 'AdminDraw::seedEntries/$1');
    $routes->post('tournaments/(:num)/update-seeds', 'AdminDraw::updateSeeds/$1');
    $routes->post('tournaments/(:num)/draw', 'AdminDraw::performDraw/$1');
    $routes->post('tournaments/(:num)/reset-draw', 'AdminDraw::resetDraw/$1');
    $routes->get('tournaments/(:num)/bracket-svg', 'AdminDraw::bracketSvg/$1');
    // AJAX endpoints for seeded selection + draw preview/redraw/save (Feature D + E)
    $routes->post('tournaments/(:num)/toggle-seeded', 'AdminDraw::toggleSeeded/$1');
    $routes->post('tournaments/(:num)/preview-draw', 'AdminDraw::previewDraw/$1');
    $routes->post('tournaments/(:num)/redraw', 'AdminDraw::redraw/$1');
    $routes->post('tournaments/(:num)/save-draw', 'AdminDraw::saveDraw/$1');
    // Bye management (manual bye before draw)
    $routes->post('tournaments/(:num)/add-bye', 'AdminDraw::addBye/$1');
    $routes->post('tournaments/(:num)/remove-bye', 'AdminDraw::removeBye/$1');
    $routes->post('tournaments/(:num)/assign-bye-slot', 'AdminDraw::assignByeSlot/$1');

    // Matches
    $routes->get('matches', 'AdminMatches::index');
    $routes->get('matches/tournament/(:num)', 'AdminMatches::byTournament/$1');
    $routes->get('matches/(:num)', 'AdminMatches::show/$1');
    $routes->post('matches/(:num)/assign-table', 'AdminMatches::assignTable/$1');
    $routes->post('matches/(:num)/schedule', 'AdminMatches::schedule/$1');
    $routes->post('matches/(:num)/assign-referee', 'AdminMatches::assignReferee/$1');
    $routes->post('matches/(:num)/toggle-tv', 'AdminMatches::toggleTv/$1');
    $routes->post('matches/(:num)/rematch', 'AdminMatches::rematch/$1');

    // Schedule
    $routes->get('schedule', 'AdminSchedule::index');
    // Per-tournament schedule view + import
    $routes->get('schedule/tournament/(:num)',          'AdminSchedule::byTournament/$1');
    $routes->get('schedule/tournament/(:num)/template', 'AdminSchedule::downloadTemplate/$1');
    $routes->get('tournaments/(:num)/schedule/import',  'AdminSchedule::importPage/$1');
    $routes->post('tournaments/(:num)/schedule/import', 'AdminSchedule::importProcess/$1');

    // Tournament committee
    $routes->get('tournaments/(:num)/committee',                          'AdminCommittee::index/$1');
    $routes->post('tournaments/(:num)/committee/add',                     'AdminCommittee::add/$1');
    $routes->post('tournaments/(:num)/committee/(:num)/update',           'AdminCommittee::update/$1/$2');
    $routes->post('tournaments/(:num)/committee/(:num)/delete',           'AdminCommittee::delete/$1/$2');
    $routes->get('tournaments/(:num)/committee/import',                   'AdminCommittee::importPage/$1');
    $routes->post('tournaments/(:num)/committee/import',                  'AdminCommittee::importProcess/$1');
    $routes->get('tournaments/(:num)/committee/template',                 'AdminCommittee::downloadTemplate/$1');

    // Scoring Sheets (Phase M — printable manual scoring sheets)
    $routes->get('scoring-sheet/(:num)', 'AdminScoringSheet::single/$1');
    $routes->get('scoring-sheet/batch', 'AdminScoringSheet::batch');
    $routes->get('scoring-sheet/batch/tournament/(:num)', 'AdminScoringSheet::batchByTournament/$1');

    // Players
    $routes->get('players',              'AdminPlayers::index');
    $routes->get('players/import',       'AdminPlayers::importPage');
    $routes->post('players/import',      'AdminPlayers::importProcess');
    $routes->get('players/template',     'AdminPlayers::downloadTemplate');
    $routes->get('players/new',          'AdminPlayers::new');
    $routes->post('players/create',      'AdminPlayers::create');
    $routes->get('players/(:num)/edit',  'AdminPlayers::edit/$1');
    $routes->post('players/(:num)/update','AdminPlayers::update/$1');
    $routes->post('players/(:num)/delete','AdminPlayers::delete/$1');

    // Teams
    $routes->get('teams', 'AdminTeams::index');
    $routes->post('teams/create', 'AdminTeams::create');
    $routes->post('teams/(:num)/delete', 'AdminTeams::delete/$1');
    $routes->post('teams/(:num)/add-member', 'AdminTeams::addMember/$1');
    $routes->post('teams/(:num)/remove-member/(:num)', 'AdminTeams::removeMember/$1/$2');

    // Tables
    $routes->get('tables', 'AdminTables::index');
    $routes->post('tables/create', 'AdminTables::create');
    $routes->get('tables/(:num)/edit', 'AdminTables::edit/$1');
    $routes->post('tables/(:num)/update', 'AdminTables::update/$1');
    $routes->post('tables/(:num)/delete', 'AdminTables::delete/$1');

    // Disciplines
    $routes->get('disciplines', 'AdminDisciplines::index');
    $routes->post('disciplines/create', 'AdminDisciplines::create');
    $routes->post('disciplines/(:num)/delete', 'AdminDisciplines::delete/$1');
    // Discipline-level rules/TIG upload + download
    $routes->get('disciplines/(:num)/rules',                  'AdminDisciplines::rulesPage/$1');
    $routes->post('disciplines/(:num)/rules/upload',          'AdminDisciplines::uploadRules/$1');
    $routes->get('disciplines/(:num)/rules/download/(:alpha)','AdminDisciplines::downloadRules/$1/$2');

    // Per-tournament TIG & game rules
    $routes->get('tournaments/(:num)/tig',                   'AdminTig::index/$1');
    $routes->post('tournaments/(:num)/tig/save',             'AdminTig::save/$1');
    $routes->get('tournaments/(:num)/tig/download/(:alpha)', 'AdminTig::download/$1/$2');

    // Geography
    $routes->get('geography', 'AdminGeography::index');
    $routes->post('countries/create',           'AdminGeography::createCountry');
    $routes->post('countries/(:num)/update',    'AdminGeography::updateCountry/$1');
    $routes->post('countries/(:num)/delete',    'AdminGeography::deleteCountry/$1');
    $routes->post('regions/create',             'AdminGeography::createRegion');
    $routes->post('regions/(:num)/update',      'AdminGeography::updateRegion/$1');
    $routes->post('regions/(:num)/delete',      'AdminGeography::deleteRegion/$1');
    // Cities (separate from provinces)
    $routes->post('cities/create',              'AdminGeography::createCity');
    $routes->post('cities/(:num)/update',       'AdminGeography::updateCity/$1');
    $routes->post('cities/(:num)/delete',       'AdminGeography::deleteCity/$1');
    $routes->get('api/cities/by-province/(:num)', 'AdminGeography::citiesByProvince/$1');
    $routes->get('api/cities/by-country/(:num)',  'AdminGeography::citiesByCountry/$1');
    $routes->post('clubs/create',               'AdminGeography::createClub');
    $routes->post('clubs/(:num)/update',        'AdminGeography::updateClub/$1');
    $routes->post('clubs/(:num)/delete',        'AdminGeography::deleteClub/$1');

    // Batch Clear Data
    $routes->get('clear',             'AdminClear::index');
    $routes->post('clear/matches',    'AdminClear::clearMatches');
    $routes->post('clear/players',    'AdminClear::clearPlayers');
    $routes->post('clear/tournaments','AdminClear::clearTournaments');
    $routes->post('clear/all',        'AdminClear::clearAll');

    // Users
    $routes->get('users', 'AdminUsers::index');
    $routes->post('users/create', 'AdminUsers::create');
    $routes->post('users/(:num)/update', 'AdminUsers::update/$1');
    $routes->post('users/(:num)/delete', 'AdminUsers::delete/$1');
    $routes->post('users/rehash-passwords', 'AdminUsers::rehashPasswords');

    // FAQ management (admin can add/edit/delete FAQ entries)
    $routes->get('faq', 'AdminFaq::index');
    $routes->post('faq/create', 'AdminFaq::create');
    $routes->post('faq/(:num)/update', 'AdminFaq::update/$1');
    $routes->post('faq/(:num)/delete', 'AdminFaq::delete/$1');
    $routes->post('faq/(:num)/toggle', 'AdminFaq::toggle/$1');

    // TV management
    $routes->get('tv', 'AdminTv::index');
    $routes->post('tv/assign', 'AdminTv::assign');
    $routes->post('tv/table/(:num)/upload-bg', 'AdminTv::uploadBackground/$1');
    $routes->post('tv/table/(:num)/clear-bg',  'AdminTv::clearBackground/$1');

    // API management
    $routes->get('api', 'AdminApi::index');
    $routes->post('api/settings', 'AdminApi::saveSettings');
    $routes->post('api/regenerate-key', 'AdminApi::regenerateKey');
    $routes->post('api/test', 'AdminApi::testEndpoint');
});

// ===== REFEREE / SCORER =====
$routes->group('referee', ['filter' => 'auth:referee,scorer,admin,superadmin'], function($routes){
    $routes->get('/', 'Scorer::index');
    $routes->get('match/(:num)', 'Scorer::match/$1');
    $routes->post('match/(:num)/start', 'Scorer::startMatch/$1');
    $routes->post('match/(:num)/score', 'Scorer::addScore/$1');
    $routes->post('match/(:num)/end-leg', 'Scorer::endLeg/$1');
    $routes->post('match/(:num)/finish', 'Scorer::finishMatch/$1');
});

$routes->group('scorer', ['filter' => 'auth:scorer,referee,admin,superadmin'], function($routes){
    $routes->get('/', 'Scorer::index');
    $routes->get('match/(:num)', 'Scorer::match/$1');
    $routes->post('match/(:num)/start', 'Scorer::startMatch/$1');
    $routes->post('match/(:num)/score', 'Scorer::addScore/$1');
    $routes->post('match/(:num)/end-leg', 'Scorer::endLeg/$1');
    $routes->post('match/(:num)/finish', 'Scorer::finishMatch/$1');
});