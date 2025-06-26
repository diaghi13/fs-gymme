<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\CentralUser;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = \App\Models\CentralUser::all();

        return Inertia::render('central/users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(CentralUser $centralUser)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CentralUser $centralUser)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CentralUser $centralUser)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CentralUser $centralUser)
    {
        //
    }
}
